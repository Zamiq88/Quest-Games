
from typing import List, Dict
from django.db.models import Q
from datetime import datetime, date, time, timedelta
import pytz
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from django.conf import settings






def sendgrid_send_email(to_email,  dynamic_template_data,template_id='d-e35c392eeaca464a8e23fab4794f0486'):

    message = Mail(
        from_email='Vidadenoche <zamiq.nuriyev@hrwise.ai>',
        to_emails=to_email,
        
    )
    message.template_id = template_id
    message.dynamic_template_data = dynamic_template_data

    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        print('responsseeeeeee',response)
        print(f"Email sent! Status code: {response.status_code}")
        return True
    except Exception as e:
        print(f"Error sending email to {to_email}: {e}")
        return False

def generate_time_slots(start_time: str, end_time: str, duration: int, interval: int = 60) -> List[str]:
    """
    Generate available time slots based on game working hours
    
    Args:
        start_time: Start time in HH:MM format
        end_time: End time in HH:MM format (00:00 means next day midnight)
        duration: Game duration in minutes
        interval: Interval between slots in minutes (default 60)
    
    Returns:
        List of time slots in HH:MM format (only round hours)
    """
    slots = []
    
    # Parse start and end times
    start_hour, start_minute = map(int, start_time.split(':'))
    end_hour, end_minute = map(int, end_time.split(':'))
    
    start_dt = datetime.combine(datetime.today(), time(start_hour, start_minute))
    
    # Handle end time - if 00:00, it means next day midnight
    if end_hour == 0 and end_minute == 0:
        end_dt = datetime.combine(datetime.today() + timedelta(days=1), time(0, 0))
    else:
        end_dt = datetime.combine(datetime.today(), time(end_hour, end_minute))
    
    # Generate slots starting from the next round hour
    current_hour = start_hour
    if start_minute > 0:
        current_hour += 1
    
    # Generate only round hour slots
    while True:
        # Handle hour overflow (past 23:00)
        display_hour = current_hour % 24
        slot_time = time(display_hour, 0)
        
        # Create datetime for the slot (could be next day if current_hour >= 24)
        if current_hour >= 24:
            slot_dt = datetime.combine(datetime.today() + timedelta(days=1), slot_time)
        else:
            slot_dt = datetime.combine(datetime.today(), slot_time)
        
        # Break if we've reached or passed the end time
        if slot_dt >= end_dt:
            break
        
        # Check if game can finish within working hours
        if slot_dt + timedelta(minutes=duration) <= end_dt:
            slots.append(f"{display_hour:02d}:00")
        
        current_hour += 1
    
    return slots


# Updated backend for Stripe Checkout redirect flow

def get_available_times(game_id: str, selected_date: str) -> Dict:
    """
    Get available time slots for a game on a specific date with capacity information
    
    Args:
        game_id: Game ID
        selected_date: Date in YYYY-MM-DD format
    
    Returns:
        Dictionary with time slots and their capacity information
    """
    
    from .models import Game, Reservation
    
    try:
        game = Game.objects.get(id=game_id, is_active=True)
        date_obj = datetime.strptime(selected_date, '%Y-%m-%d').date()
        
        # FIXED: Get current time in Spain timezone
        spain_tz = pytz.timezone('Europe/Madrid')
        now_spain = datetime.now(spain_tz)
        today_spain = now_spain.date()
        

        
        # Check if date is in the past (but allow today in Spain timezone)
        if date_obj < today_spain:
            return {
                'error': 'Cannot book for past dates',
                'time_slots': []
            }
        
        # Check if game is available (for pre_reservation games)
        if game.status == 'pre_reservation' and game.available_from:
            if datetime.combine(date_obj, datetime.min.time()) < game.available_from:
                return {
                    'error': f'Game available from {game.available_from.strftime("%Y-%m-%d %H:%M")}',
                    'time_slots': []
                }
        
        # Generate all possible time slots
        all_slots = generate_time_slots(
            game.working_hours_start,
            game.working_hours_end,
            game.duration
        )
        
        # Filter out past time slots ONLY for today
        if date_obj == today_spain:
            current_hour = now_spain.hour
            # If we're past the current hour's start, move to next hour
            if now_spain.minute > 0:
                current_hour += 1
            
            # Filter slots to only include future times (only for today)
            all_slots = [slot for slot in all_slots if int(slot.split(':')[0]) >= current_hour]
        
        # Get reservations for this date and calculate capacity for each slot
        reservations_today = Reservation.objects.filter(
            game=game,
            date=date_obj,
            status__in=['pending', 'confirmed']
        )
        
        # Also check next day for slots that might conflict (if working hours cross midnight)
        reservations_next_day = []
        end_hour = int(game.working_hours_end.split(':')[0])
        if end_hour == 0:  # Working hours cross midnight
            next_date = date_obj + timedelta(days=1)
            reservations_next_day = Reservation.objects.filter(
                game=game,
                date=next_date,
                status__in=['pending', 'confirmed']
            )
        
        # Calculate capacity for each time slot
        time_slots = []
        for slot in all_slots:
            slot_hour = int(slot.split(':')[0])
            slot_time = datetime.combine(date_obj, time(slot_hour, 0))
            slot_end_time = slot_time + timedelta(minutes=game.duration)
            
            # Calculate used capacity for this slot
            used_capacity = 0
            
            # Check overlapping reservations from today
            for reservation in reservations_today:
                reservation_datetime = datetime.combine(date_obj, reservation.time)
                reservation_end_time = reservation_datetime + timedelta(minutes=game.duration)
                
                # Check for overlap
                if (slot_time < reservation_end_time and slot_end_time > reservation_datetime):
                    used_capacity += reservation.players
            
            # Check overlapping reservations from next day (for late night slots)
            if reservations_next_day:
                next_date = date_obj + timedelta(days=1)
                for reservation in reservations_next_day:
                    reservation_datetime = datetime.combine(next_date, reservation.time)
                    reservation_end_time = reservation_datetime + timedelta(minutes=game.duration)
                    
                    # Check for overlap
                    if (slot_time < reservation_end_time and slot_end_time > reservation_datetime):
                        used_capacity += reservation.players
            
            # Calculate available capacity
            available_capacity = max(0, game.max_players - used_capacity)
            
            time_slots.append({
                'time': slot,
                'available_capacity': available_capacity,
                'used_capacity': used_capacity,
                'max_capacity': game.max_players,
                'available': available_capacity > 0
            })
        
        return {
            'game_title': game.get_title('ru'),
            'date': selected_date,
            'time_slots': time_slots,
            'duration': game.duration,
            'max_players': game.max_players
        }
        
    except Game.DoesNotExist:
        return {
            'error': 'Game not found',
            'time_slots': []
        }
    except ValueError:
        return {
            'error': 'Invalid date format. Use YYYY-MM-DD',
            'time_slots': []
        }
