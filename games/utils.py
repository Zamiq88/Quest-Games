from datetime import datetime, time, timedelta
from typing import List, Dict
from django.db.models import Q

def generate_time_slots(start_time: str, end_time: str, duration: int, interval: int = 60) -> List[str]:
    """
    Generate available time slots based on game working hours
    
    Args:
        start_time: Start time in HH:MM format
        end_time: End time in HH:MM format  
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
    end_dt = datetime.combine(datetime.today(), time(end_hour, end_minute))
    
    # Generate slots starting from the next round hour
    current_hour = start_hour
    if start_minute > 0:
        current_hour += 1
    
    # Generate only round hour slots
    while current_hour < end_hour:
        slot_time = time(current_hour, 0)
        slot_dt = datetime.combine(datetime.today(), slot_time)
        
        # Check if game can finish within working hours
        if slot_dt + timedelta(minutes=duration) <= end_dt:
            slots.append(f"{current_hour:02d}:00")
        
        current_hour += 1
    
    return slots


def get_available_times(game_id: str, selected_date: str) -> Dict:
    """
    Get available time slots for a game on a specific date
    
    Args:
        game_id: Game ID
        selected_date: Date in YYYY-MM-DD format
    
    Returns:
        Dictionary with available and booked time slots
    """
    from .models import Game, Reservation
    from datetime import datetime
    
    try:
        game = Game.objects.get(id=game_id, is_active=True)
        date_obj = datetime.strptime(selected_date, '%Y-%m-%d').date()
        now = datetime.now()
        
        # Check if date is in the past (but allow today)
        if date_obj < now.date():
            return {
                'error': 'Cannot book for past dates',
                'available_slots': [],
                'booked_slots': []
            }
        
        # Check if game is available (for pre_reservation games)
        if game.status == 'pre_reservation' and game.available_from:
            if datetime.combine(date_obj, datetime.min.time()) < game.available_from:
                return {
                    'error': f'Game available from {game.available_from.strftime("%Y-%m-%d %H:%M")}',
                    'available_slots': [],
                    'booked_slots': []
                }
        
        # Generate all possible time slots
        all_slots = generate_time_slots(
            game.working_hours_start,
            game.working_hours_end,
            game.duration
        )
        
        # Filter out past time slots for today
        if date_obj == now.date():
            current_hour = now.hour
            # If we're past the current hour's start, move to next hour
            if now.minute > 0:
                current_hour += 1
            
            # Filter slots to only include future times
            all_slots = [slot for slot in all_slots if int(slot.split(':')[0]) >= current_hour]
        
        # Get booked slots for this date
        booked_reservations = Reservation.objects.filter(
            game=game,
            date=date_obj,
            status__in=['pending', 'confirmed']
        ).values_list('time', flat=True)
        
        booked_slots = [t.strftime('%H:%M') for t in booked_reservations]
        
        # Remove slots that conflict with booked reservations considering game duration
        available_slots = []
        for slot in all_slots:
            slot_hour = int(slot.split(':')[0])
            slot_time = datetime.combine(date_obj, time(slot_hour, 0))
            slot_end_time = slot_time + timedelta(minutes=game.duration)
            
            # Check if this slot conflicts with any booked reservation
            is_available = True
            for booked_time in booked_reservations:
                booked_datetime = datetime.combine(date_obj, booked_time)
                booked_end_time = booked_datetime + timedelta(minutes=game.duration)
                
                # Check for overlap: slot overlaps with booked time
                if (slot_time < booked_end_time and slot_end_time > booked_datetime):
                    is_available = False
                    break
            
            if is_available:
                available_slots.append(slot)
        
        return {
            'game_title': game.get_title('ru'),
            'date': selected_date,
            'all_slots': all_slots,
            'available_slots': available_slots,
            'booked_slots': booked_slots,
            'duration': game.duration,
            'max_players': game.max_players
        }
        
    except Game.DoesNotExist:
        return {
            'error': 'Game not found',
            'available_slots': [],
            'booked_slots': []
        }
    except ValueError:
        return {
            'error': 'Invalid date format. Use YYYY-MM-DD',
            'available_slots': [],
            'booked_slots': []
        }