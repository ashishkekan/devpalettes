(function() {
    const titleInput = document.getElementById('meta-title');
    const descInput = document.getElementById('meta-desc');
    const imgInput = document.getElementById('meta-img');
    
    window.updatePreview = function() {
       const title = titleInput.value;
       const desc = descInput.value;
       const img = imgInput.value;
       
       document.getElementById('fb-title').textContent = title;
       document.getElementById('fb-desc').textContent = desc;
       document.getElementById('fb-img').style.backgroundImage = img ? `url(${img})` : 'none';
       
       document.getElementById('tw-title').textContent = title;
       document.getElementById('tw-desc').textContent = desc;
       document.getElementById('tw-img').style.backgroundImage = img ? `url(${img})` : 'none';

       document.getElementById('linkedin-title').textContent = title;
       document.getElementById('linkedin-desc').textContent = desc;
       document.getElementById('linkedin-img').style.backgroundImage = img ? `url(${img})` : 'none';

       document.getElementById('whatsapp-title').textContent = title;
       document.getElementById('whatsapp-desc').textContent = desc;
       document.getElementById('whatsapp-img').style.backgroundImage = img ? `url(${img})` : 'none';

       document.getElementById('pinterest-title').textContent = title;
       document.getElementById('pinterest-desc').textContent = desc;
       document.getElementById('pinterest-img').style.backgroundImage = img ? `url(${img})` : 'none';

       document.getElementById('slack-title').textContent = title;
       document.getElementById('slack-desc').textContent = desc;
       document.getElementById('slack-img').style.backgroundImage = img ? `url(${img})` : 'none';
    };
    
    // Copy Link button functionality
    var copyLinkBtn = document.getElementById('copy-link-btn');
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', function() {
        var url = 'https://devpalettes.com/social-meta-preview/';
        navigator.clipboard.writeText(url).then(function() {
          var originalHTML = copyLinkBtn.innerHTML;
          copyLinkBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Copied!';
          copyLinkBtn.setAttribute('aria-label', 'Link copied to clipboard');
          
          setTimeout(function() {
            copyLinkBtn.innerHTML = originalHTML;
            copyLinkBtn.setAttribute('aria-label', 'Copy page link to clipboard');
          }, 2000);
        }).catch(function() {
          // Fallback for older browsers
          var textarea = document.createElement('textarea');
          textarea.value = url;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          try { document.execCommand('copy'); } catch(e) {}
          document.body.removeChild(textarea);
          
          var originalHTML = copyLinkBtn.innerHTML;
          copyLinkBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Copied!';
          copyLinkBtn.setAttribute('aria-label', 'Link copied to clipboard');
          setTimeout(function() {
            copyLinkBtn.innerHTML = originalHTML;
            copyLinkBtn.setAttribute('aria-label', 'Copy page link to clipboard');
          }, 2000);
        });
      });
    }
    
    updatePreview();
})();
