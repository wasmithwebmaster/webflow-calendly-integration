(function() {
  'use strict';
  
  let formData = {};
  let calendlyInitialized = false;
  
  // Capture form data on submit
  function captureFormData() {
    const form = document.querySelector('form[id*="wf-form"], .w-form form');
    if (form) {
      form.addEventListener('submit', function() {
        formData = {
          location: document.getElementById('meeting_location')?.value || '',
          firstName: document.getElementById('first_name')?.value || '',
          lastName: document.getElementById('last_name')?.value || '',
          email: document.getElementById('email')?.value || '',
          message: document.getElementById('message')?.value || ''
        };
        console.log('✓ Form data captured:', formData);
      });
    }
  }
  
  // Initialize Calendly widget
  function initCalendlyWidget() {
    if (calendlyInitialized) {
      console.log('⚠ Calendly already initialized, skipping');
      return;
    }
    
    const selectedLocation = formData.location;
    
    if (!selectedLocation) {
      console.error('✗ No location selected');
      return;
    }
    
    console.log('→ Processing location:', selectedLocation);
    
    // Hide all containers
    const allContainers = document.querySelectorAll('.w-form-done [data-loc]');
    allContainers.forEach(container => {
      container.style.display = 'none';
    });
    
    // Show matching container
    const targetContainer = document.querySelector(`.w-form-done [data-loc="${selectedLocation}"]`);
    
    if (!targetContainer) {
      console.error('✗ No container found for:', selectedLocation);
      return;
    }
    
    targetContainer.style.display = 'block';
    console.log('✓ Container visible for:', selectedLocation);
    
    // Find widget
    const calendlyWidget = targetContainer.querySelector('.calendly-inline-widget');
    
    if (!calendlyWidget) {
      console.error('✗ No Calendly widget found');
      return;
    }
    
    // Clear any auto-initialized iframe
    calendlyWidget.innerHTML = '';
    
    const calendlyUrl = calendlyWidget.getAttribute('data-url');
    
    if (!calendlyUrl) {
      console.error('✗ No Calendly URL found');
      return;
    }
    
    // Prepare prefill
    const prefillData = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      customAnswers: {
        a1: formData.message
      }
    };
    
    console.log('→ Initializing Calendly...');
    console.log('  URL:', calendlyUrl);
    console.log('  Prefill:', prefillData);
    
    // Initialize
    if (window.Calendly) {
      window.Calendly.initInlineWidget({
        url: calendlyUrl,
        parentElement: calendlyWidget,
        prefill: prefillData
      });
      calendlyInitialized = true;
      console.log('✓ Calendly initialized successfully!');
    } else {
      console.error('✗ Calendly library not loaded');
      // Retry after delay
      setTimeout(initCalendlyWidget, 500);
    }
  }
  
  // Watch for success message
  function watchForSuccess() {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        // Check added nodes
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) {
            const successMsg = node.classList?.contains('w-form-done') ? node : node.querySelector?.('.w-form-done');
            if (successMsg && successMsg.style.display !== 'none') {
              console.log('✓ Success message appeared');
              setTimeout(initCalendlyWidget, 300);
            }
          }
        });
        
        // Check style changes
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target;
          if (target.classList?.contains('w-form-done') && target.style.display !== 'none') {
            console.log('✓ Success message became visible');
            setTimeout(initCalendlyWidget, 300);
          }
        }
      });
    });
    
    const formContainer = document.querySelector('.w-form');
    if (formContainer) {
      observer.observe(formContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      });
      console.log('✓ MutationObserver active');
    }
  }
  
  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      captureFormData();
      watchForSuccess();
    });
  } else {
    captureFormData();
    watchForSuccess();
  }
  
})();
