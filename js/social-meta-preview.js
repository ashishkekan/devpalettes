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
       document.getElementById('fb-img').style.backgroundImage = `url(${img})`;
       
       document.getElementById('tw-title').textContent = title;
       document.getElementById('tw-desc').textContent = desc;
       document.getElementById('tw-img').style.backgroundImage = `url(${img})`;
    };
    
    updatePreview();
})();
