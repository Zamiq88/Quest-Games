console.log('Game toggle script loaded');

function toggleAvailableFromField() {
    console.log('toggleAvailableFromField called');
    
    var statusField = document.getElementById('id_status');
    var availableFromDateField = document.getElementById('id_available_from_0');
    var availableFromTimeField = document.getElementById('id_available_from_1');
    
    console.log('Status field:', statusField);
    console.log('Available from date field:', availableFromDateField);
    console.log('Available from time field:', availableFromTimeField);
    
    if (!statusField || !availableFromDateField || !availableFromTimeField) {
        console.log('Fields not found, retrying...');
        setTimeout(toggleAvailableFromField, 200);
        return;
    }
    
    // Find the container row for the available_from field
    var availableFromRow = availableFromDateField.closest('.form-row') || 
                          availableFromDateField.closest('.field-available_from') ||
                          availableFromDateField.closest('div');
    
    var selectedStatus = statusField.value;
    
    console.log('Current status:', selectedStatus);
    console.log('Available from row:', availableFromRow);
    
    if (selectedStatus === 'available_now') {
        console.log('Disabling available_from fields');
        
        // Disable both date and time fields
        availableFromDateField.disabled = true;
        availableFromTimeField.disabled = true;
        
        // Clear values
        availableFromDateField.value = '';
        availableFromTimeField.value = '';
        
        // Apply disabled styling
        availableFromDateField.style.backgroundColor = '#f5f5f5';
        availableFromDateField.style.color = '#999';
        availableFromTimeField.style.backgroundColor = '#f5f5f5';
        availableFromTimeField.style.color = '#999';
        
        // Dim the entire row
        if (availableFromRow) {
            availableFromRow.style.opacity = '0.6';
            availableFromRow.style.pointerEvents = 'none';
        }
        
    } else if (selectedStatus === 'pre_reservation') {
        console.log('Enabling available_from fields');
        
        // Enable both date and time fields
        availableFromDateField.disabled = false;
        availableFromTimeField.disabled = false;
        
        // Remove disabled styling
        availableFromDateField.style.backgroundColor = '';
        availableFromDateField.style.color = '';
        availableFromTimeField.style.backgroundColor = '';
        availableFromTimeField.style.color = '';
        
        // Restore the entire row
        if (availableFromRow) {
            availableFromRow.style.opacity = '1';
            availableFromRow.style.pointerEvents = 'auto';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing toggle');
    toggleAvailableFromField();
});

setTimeout(function() {
    console.log('Timeout initialization');
    toggleAvailableFromField();
}, 1000);