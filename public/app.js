document.addEventListener('DOMContentLoaded', () => {
    // Handle form submission
    document.getElementById('booking-form').addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const numSeats = parseInt(document.getElementById('numSeats').value, 10);
  
      try {
        const response = await fetch('/book', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ numSeats })
        });
  
        const data = await response.json();
  
        if (data.success) {
          alert(`Seats booked: ${data.bookedSeats.join(', ')}`);
          updateSeatLayout();
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while booking seats.');
      }
    });
  
    // Function to update the seat layout
    async function updateSeatLayout() {
      try {
        const response = await fetch('/layout');
        const text = await response.text();
  
        document.getElementById('seat-layout').innerHTML = text;
      } catch (error) {
        console.error('Error updating seat layout:', error);
      }
    }
  
    // Initial load of seat layout
    updateSeatLayout();
  });
  