/* Instant Ugen — bidrag-formular. No backend: validates client-side and
   keeps a small local demo-feed of "seneste bidrag" in localStorage
   (private to this browser only — not a real submission). */
(function(){
  "use strict";
  var form = document.querySelector("[data-contrib-form]");
  if (!form) return;

  var fileInput = form.querySelector("#billede");
  var fileDrop = form.querySelector("[data-file-drop]");
  var filePreview = form.querySelector("[data-file-preview]");
  var card = document.querySelector("[data-form-card]");
  var confirmEl = document.querySelector("[data-confirm]");
  var confirmName = document.querySelector("[data-confirm-name]");
  var recentSection = document.querySelector("[data-recent]");
  var recentStrip = document.querySelector("[data-recent-strip]");
  var resetBtn = document.querySelector("[data-reset-form]");

  var currentDataUrl = null;

  /* ---- file drop / preview ---- */
  function handleFile(file){
    if (!file) return;
    var okType = /^(image\/jpeg|image\/jpg|image\/webp)$/.test(file.type);
    var okSize = file.size >= 0 && file.size <= 10 * 1024 * 1024; // client can't easily enforce a floor pre-compression
    var fieldWrap = fileDrop.closest(".field");
    if (!okType){
      fieldWrap.classList.add("invalid");
      fieldWrap.querySelector(".error").textContent = "Filen skal være jpg, jpeg eller webp.";
      return;
    }
    if (!okSize){
      fieldWrap.classList.add("invalid");
      fieldWrap.querySelector(".error").textContent = "Filen skal være maks. 10 MB.";
      return;
    }
    fieldWrap.classList.remove("invalid");
    var reader = new FileReader();
    reader.onload = function(e){
      currentDataUrl = e.target.result;
      filePreview.querySelector("img").src = currentDataUrl;
      filePreview.querySelector(".name").textContent = file.name;
      filePreview.classList.add("is-shown");
    };
    reader.readAsDataURL(file);
  }

  fileInput.addEventListener("change", function(){ handleFile(fileInput.files[0]); });
  ["dragenter","dragover"].forEach(function(ev){
    fileDrop.addEventListener(ev, function(e){ e.preventDefault(); fileDrop.classList.add("is-dragover"); });
  });
  ["dragleave","drop"].forEach(function(ev){
    fileDrop.addEventListener(ev, function(e){ e.preventDefault(); fileDrop.classList.remove("is-dragover"); });
  });
  fileDrop.addEventListener("drop", function(e){
    var file = e.dataTransfer.files[0];
    if (file){
      try { fileInput.files = e.dataTransfer.files; } catch(err){}
      handleFile(file);
    }
  });
  filePreview.querySelector("[data-file-remove]").addEventListener("click", function(){
    fileInput.value = "";
    currentDataUrl = null;
    filePreview.classList.remove("is-shown");
  });

  /* ---- validation ---- */
  function setError(field, msg){
    var wrap = field.closest(".field");
    if (!wrap) return;
    wrap.classList.add("invalid");
    var err = wrap.querySelector(".error");
    if (err) err.textContent = msg;
  }
  function clearError(field){
    var wrap = field.closest(".field");
    if (wrap) wrap.classList.remove("invalid");
  }

  function validate(){
    var valid = true;
    var name = form.querySelector("#navn");
    var email = form.querySelector("#email");
    var title = form.querySelector("#titel");
    var desc = form.querySelector("#beskrivelse");
    var terms = form.querySelector("#vilkaar");

    [name, email, title, desc].forEach(function(f){ clearError(f); });

    if (!name.value.trim()){ setError(name, "Skriv dit fulde navn."); valid = false; }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)){ setError(email, "Skriv en gyldig e-mail."); valid = false; }
    if (!title.value.trim()){ setError(title, "Giv dit instant en titel."); valid = false; }
    if (!desc.value.trim()){ setError(desc, "Fortæl kort historien bag billedet."); valid = false; }
    if (!currentDataUrl){
      var wrap = fileDrop.closest(".field");
      wrap.classList.add("invalid");
      wrap.querySelector(".error").textContent = "Upload et billede af dit instant.";
      valid = false;
    }
    if (!terms.checked){
      terms.closest(".field").classList.add("invalid");
      valid = false;
    }
    return valid;
  }

  form.addEventListener("submit", function(e){
    e.preventDefault();
    if (!validate()) return;

    var name = form.querySelector("#navn").value.trim();
    var title = form.querySelector("#titel").value.trim();
    var desc = form.querySelector("#beskrivelse").value.trim();

    saveLocalSubmission({ name: name, title: title, desc: desc, img: currentDataUrl, ts: Date.now() });

    card.classList.add("is-confirmed");
    confirmEl.classList.add("is-shown");
    confirmName.textContent = name.split(" ")[0] || name;
    confirmEl.scrollIntoView({ behavior: "smooth", block: "center" });
    renderRecent();
  });

  resetBtn && resetBtn.addEventListener("click", function(){
    form.reset();
    currentDataUrl = null;
    filePreview.classList.remove("is-shown");
    card.classList.remove("is-confirmed");
    confirmEl.classList.remove("is-shown");
    form.querySelectorAll(".field.invalid").forEach(function(f){ f.classList.remove("invalid"); });
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---- local demo feed (this browser only) ---- */
  var STORE_KEY = "instantugen_bidrag_demo";
  function saveLocalSubmission(entry){
    var list = [];
    try { list = JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch(err){}
    list.unshift(entry);
    list = list.slice(0, 5);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch(err){}
  }
  function renderRecent(){
    var list = [];
    try { list = JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch(err){}
    if (!recentSection) return;
    if (!list.length){ recentSection.classList.remove("is-shown"); return; }
    recentStrip.innerHTML = "";
    list.forEach(function(item){
      var fig = document.createElement("figure");
      fig.className = "polaroid";
      fig.innerHTML = '<img src="' + item.img + '" alt="' + item.title.replace(/"/g,"&quot;") + '"><figcaption>' + item.title + "</figcaption>";
      recentStrip.appendChild(fig);
    });
    recentSection.classList.add("is-shown");
  }
  renderRecent();
})();
