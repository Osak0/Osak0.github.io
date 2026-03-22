(function () {
  var BLOGS = [
    {
      title: "我的第一篇博客",
      summary: "记录搭建个人网站的过程与想法。",
      date: "2026-03-22"
    },
    {
      title: "学习笔记整理方法",
      summary: "如何按分类保存笔记并快速回顾。",
      date: "2026-03-21"
    }
  ];

  var STORAGE_KEYS = {
    notes: "osako_notes",
    photos: "osako_photos"
  };
  var MAX_PHOTO_ITEMS = 60;

  var blogList = document.getElementById("blog-list");
  var noteForm = document.getElementById("note-form");
  var noteTitle = document.getElementById("note-title");
  var noteCategory = document.getElementById("note-category");
  var noteContent = document.getElementById("note-content");
  var noteList = document.getElementById("note-list");
  var noteFeedback = document.getElementById("note-feedback");
  var importFileInput = document.getElementById("import-file");
  var imageImportInput = document.getElementById("image-import");
  var photoWall = document.getElementById("photo-wall");

  var notes = readStorage(STORAGE_KEYS.notes, []);
  var photos = readStorage(STORAGE_KEYS.photos, []);

  function readStorage(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function renderBlogs() {
    blogList.innerHTML = "";
    BLOGS.forEach(function (blog) {
      var item = document.createElement("article");
      item.className = "blog-item";
      item.innerHTML = "<h3>" + escapeHtml(blog.title) + "</h3>" +
        "<small>" + escapeHtml(blog.date) + "</small>" +
        "<p>" + escapeHtml(blog.summary) + "</p>";
      blogList.appendChild(item);
    });
  }

  function renderNotes() {
    noteList.innerHTML = "";
    if (!notes.length) {
      noteList.innerHTML = "<p>还没有笔记，开始写第一条吧。</p>";
      return;
    }

    notes
      .slice()
      .reverse()
      .forEach(function (note) {
        var item = document.createElement("article");
        item.className = "note-item";
        item.innerHTML =
          "<h3>" + escapeHtml(note.title) + "</h3>" +
          "<small>分类：" + escapeHtml(note.category) + " · " + escapeHtml(note.createdAt) + "</small>" +
          "<p>" + escapeHtml(note.content).replace(/\n/g, "<br>") + "</p>";
        noteList.appendChild(item);
      });
  }

  function renderPhotos() {
    photoWall.innerHTML = "";
    if (!photos.length) {
      photoWall.innerHTML = "<p>暂无图片，点击“导入图片”上传到照片墙。</p>";
      return;
    }

    photos.forEach(function (src) {
      var img = document.createElement("img");
      img.src = src;
      img.alt = "照片墙图片";
      img.loading = "lazy";
      photoWall.appendChild(img);
    });
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  noteForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var title = noteTitle.value.trim();
    var category = noteCategory.value;
    var content = noteContent.value.trim();

    if (!title || !content) {
      noteFeedback.textContent = "请完整填写标题和内容。";
      return;
    }

    notes.push({
      title: title,
      category: category,
      content: content,
      createdAt: new Date().toLocaleString()
    });

    writeStorage(STORAGE_KEYS.notes, notes);
    renderNotes();
    noteForm.reset();
    noteFeedback.textContent = "笔记已保存。";
  });

  importFileInput.addEventListener("change", function (event) {
    var file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    var reader = new FileReader();
    reader.onload = function () {
      noteContent.value = String(reader.result || "");
      noteTitle.value = noteTitle.value || file.name.replace(/\.[^.]+$/, "");
      noteFeedback.textContent = "文件已导入到编辑器，请确认后保存笔记。";
    };
    reader.readAsText(file);
    importFileInput.value = "";
  });

  imageImportInput.addEventListener("change", function (event) {
    var files = event.target.files
      ? Array.prototype.slice.call(event.target.files).filter(function (file) {
          return file.type.indexOf("image/") === 0;
        })
      : [];
    if (!files.length) {
      return;
    }

    var readTasks = files.map(function (file) {
      return new Promise(function (resolve) {
        var reader = new FileReader();
        reader.onload = function () {
          resolve(String(reader.result || ""));
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readTasks).then(function (images) {
      photos = photos.concat(images).slice(-MAX_PHOTO_ITEMS);
      writeStorage(STORAGE_KEYS.photos, photos);
      renderPhotos();
    });

    imageImportInput.value = "";
  });

  renderBlogs();
  renderNotes();
  renderPhotos();
})();
