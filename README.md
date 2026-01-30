# Webflow + Calendly Conditional Embed with Prefill

This implementation shows the correct Calendly calendar based on a dropdown selection in your Webflow form, with automatic prefilling of user data.

---

## Requirements

Your Webflow form must have these exact field IDs:
- `meeting_location` - Dropdown with values: sheffield, sandusky, independence, sarasota, virtual
- `first_name` - Text input
- `last_name` - Text input
- `email` - Email input
- `message` - Textarea

---

## Step 1: Success Message HTML

In Webflow Designer, edit your form's **Success Message** (`.w-form-done`) and paste this HTML:

```html
<div>Thank you! Please schedule your meeting below:</div>
<div data-loc="sheffield" style="display:none;">
  <div class="calendly-inline-widget" 
       data-url="https://calendly.com/d/csr9-pgz-qyg/retirement-tune-up-financial-review-at-sheffield?background_color=fffbf2&text_color=333230&primary_color=648d32" 
       style="min-width:320px;height:700px;"></div>
</div>
<div data-loc="sandusky" style="display:none;">
  <div class="calendly-inline-widget" 
       data-url="https://calendly.com/d/cxd5-9bz-kwf/retirement-tune-up-financial-review-at-sandusky?background_color=fffbf2&text_color=333230&primary_color=648d32" 
       style="min-width:320px;height:700px;"></div>
</div>
<div data-loc="independence" style="display:none;">
  <div class="calendly-inline-widget" 
       data-url="https://calendly.com/d/cs87-97t-bdv/retirement-tune-up-financial-review-at-independence?background_color=fffbf2&text_color=333230&primary_color=648d32" 
       style="min-width:320px;height:700px;"></div>
</div>
<div data-loc="sarasota" style="display:none;">
  <div class="calendly-inline-widget" 
       data-url="https://calendly.com/d/cskv-5w8-6d7/retirement-tune-up-financial-review-at-sarasota?background_color=fffbf2&text_color=333230&primary_color=648d32" 
       style="min-width:320px;height:700px;"></div>
</div>
<div data-loc="virtual" style="display:none;">
  <div class="calendly-inline-widget" 
       data-url="https://calendly.com/d/cw72-8x5-kt7/retirement-tune-up-financial-review-virtual?background_color=fffbf2&text_color=333230&primary_color=648d32" 
       style="min-width:320px;height:700px;"></div>
</div>
```

---

## Step 2: Page Code (Before `</body>` tag)

In Webflow: **Page Settings → Custom Code → Before `</body>` tag**

Paste this code:

```html
<script src="https://assets.calendly.com/assets/external/widget.js" type="text/javascript" async></script>

<script>
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
</script>
```

---

## How It Works

1. User fills out form and selects a location from dropdown
2. Form submits to Zapier normally
3. Success message appears (`.w-form-done`)
4. MutationObserver detects success message
5. Script shows only the `data-loc` div matching the selected location
6. Script clears any auto-initialized Calendly iframe
7. Script initializes Calendly with prefilled data:
   - Name (first + last)
   - Email
   - Custom Answer a1 (message field)

---

## Troubleshooting

**Open browser console (F12) to see debug messages:**

Expected output:
```
✓ MutationObserver active
✓ Form data captured: {location: "sheffield", firstName: "John", ...}
✓ Success message appeared
→ Processing location: sheffield
✓ Container visible for: sheffield
→ Initializing Calendly...
✓ Calendly initialized successfully!
```

**Common Issues:**

| Problem | Solution |
|---------|----------|
| "No location selected" | Check dropdown ID is `meeting_location` |
| "No container found" | Check dropdown values match `data-loc` exactly |
| Wrong calendar shows | Verify dropdown option **values** (not labels) |
| Two calendars show | `calendlyWidget.innerHTML = '';` clears the first one |
| No prefill | Check field IDs: `first_name`, `last_name`, `email`, `message` |

---

## Optional: Adjust Calendar Height

To change the calendar height, modify `height:700px` in the success message HTML.

For example, to make it taller:
```html
style="min-width:320px;height:1200px;"
```

Note: There's no auto-sizing. Pick a height that fits your calendar without scrolling or too much white space.

---

## Notes

- Form still submits to Zapier normally
- No redirects, no popups
- Styling parameters stay in the `data-url` query string
- Only one calendar initializes (the one matching the selected location)
- Prefill data comes from form fields captured before submission
