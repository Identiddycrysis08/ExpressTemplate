document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const button = document.getElementById('contact-submit');
  const status = document.getElementById('contact-form-status');
  if (!form || !button || !status) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    button.disabled = true;
    status.textContent = 'Sending your message…';

    try {
      const formData = new FormData(form);
      const response = await fetch('/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message')
        })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to send your message. Please try again.');
      }

      status.textContent = result.message;
      form.reset();
    } catch (error) {
      console.error('Contact form submission failed:', error);
      status.textContent = error.message || 'An error occurred while submitting the form.';
    } finally {
      button.disabled = false;
    }
  });
});
