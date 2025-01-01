Survey.StylesManager.applyTheme("modern");

let tasksTable;

const taskSurveyJson = {
  title: "Görev Formu",
  elements: [
    {
      type: "text",
      name: "title",
      title: "Görev Başlığı",
      isRequired: true
    },
    {
      type: "text",
      name: "description",
      title: "Açıklama"
    },
    {
      type: "comment",
      name: "categories",
      title: "Kategori ID'leri (virgülle ayırın)"
    },
    {
      type: "dropdown",
      name: "status",
      title: "Durum",
      isRequired: true,
      defaultValue: "todo",
      choices: [
        { value: "todo", text: "Yapılacak" },
        { value: "inProgress", text: "Devam Ediyor" },
        { value: "done", text: "Tamamlandı" }
      ]
    },
    {
      type: "text",
      name: "assignee",
      title: "Atanacak Kullanıcı ID (Opsiyonel)"
    },
    {
      type: "text",
      name: "startDate",
      title: "Başlama Tarihi (YYYY-MM-DD)"
    },
    {
      type: "text",
      name: "endDate",
      title: "Bitiş Tarihi (YYYY-MM-DD)"
    }
  ],
  showQuestionNumbers: false
};

function translateStatus(status) {
  switch (status) {
    case 'todo': return 'Yapılacak';
    case 'inProgress': return 'Devam Ediyor';
    case 'done': return 'Tamamlandı';
    default: return status;
  }
}

function showSurvey(data, callback) {
  // Mevcut survey container varsa temizle
  $("#surveyContainer").remove();
  
  // Yeni container oluştur
  const surveyContainer = $('<div>', {
    id: 'surveyContainer',
    class: 'modal fade',
    tabindex: '-1',
    role: 'dialog'
  }).append(
    $('<div>', {
      class: 'modal-dialog modal-lg',
      role: 'document'
    }).append(
      $('<div>', {
        class: 'modal-content'
      }).append(
        $('<div>', {
          class: 'modal-body',
          id: 'surveyElement'
        })
      )
    )
  );

  // Container'ı body'e ekle
  $('body').append(surveyContainer);

  // Survey'i oluştur
  const survey = new Survey.Model(taskSurveyJson);
  
  // Eğer data varsa yükle
  if (data) {
    survey.data = data;
  }

  // Complete handler'ı ekle
  survey.onComplete.add((surveyData) => {
    callback(surveyData);
    $("#surveyContainer").modal('hide');
  });

  // Survey'i render et
  $("#surveyElement").Survey({ model: survey });

  // Modal'ı göster
  $("#surveyContainer").modal('show');
}

// Görev listesini tekrar yüklemek (filtreli / filtresiz)
function reloadTasks() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Önce giriş yapmalısınız!");
    window.location.href = 'login.html';
    return;
  }

  // Filtre alanlarını oku
  const title = $("#filterTitle").val().trim();
  const status = $("#filterStatus").val().trim();
  const assignee = $("#filterAssignee").val().trim();
  const categoryId = $("#filterCategory").val().trim();

  const startDateMin = $("#filterStartDateMin").val();
  const startDateMax = $("#filterStartDateMax").val();
  const endDateMin = $("#filterEndDateMin").val();
  const endDateMax = $("#filterEndDateMax").val();

  // Query parametreleri oluştur
  let queryParams = [];
  if(title)          queryParams.push(`title=${encodeURIComponent(title)}`);
  if(status)         queryParams.push(`status=${encodeURIComponent(status)}`);
  if(assignee)       queryParams.push(`assignee=${encodeURIComponent(assignee)}`);
  if(categoryId)     queryParams.push(`categoryId=${encodeURIComponent(categoryId)}`);
  if(startDateMin)   queryParams.push(`startDateMin=${encodeURIComponent(startDateMin)}`);
  if(startDateMax)   queryParams.push(`startDateMax=${encodeURIComponent(startDateMax)}`);
  if(endDateMin)     queryParams.push(`endDateMin=${encodeURIComponent(endDateMin)}`);
  if(endDateMax)     queryParams.push(`endDateMax=${encodeURIComponent(endDateMax)}`);

  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

  $.ajax({
    url: `${API_URL}/tasks${queryString}`,
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    success: function(res) {
      tasksTable.clear();
      res.forEach(task => {
        let categoryNames = "";
        if (task.categories && Array.isArray(task.categories)) {
          categoryNames = task.categories.map(cat => cat.name).join(", ");
        }

        const statusText = translateStatus(task.status);
        const assigneeEmail = (task.assignee && task.assignee.email) ? task.assignee.email : "-";

        // startDate, endDate görsel format
        const startDateShow = task.startDate ? new Date(task.startDate).toLocaleDateString() : "-";
        const endDateShow = task.endDate ? new Date(task.endDate).toLocaleDateString() : "-";

        tasksTable.row.add([
          task.title,
          task.description || "",
          categoryNames,
          statusText,
          assigneeEmail,
          startDateShow,
          endDateShow,
          `
            <button class="btn btn-sm btn-info btn-edit" data-id="${task._id}">Düzenle</button>
            <button class="btn btn-sm btn-danger btn-delete" data-id="${task._id}">Sil</button>
          `
        ]);
      });
      tasksTable.draw();
    },
    error: function(err) {
      console.error(err);
      alert("Görevler getirilemedi!");
    }
  });
}

// Yeni görev oluşturma
function createTask(data) {
  const token = localStorage.getItem('token');
  const postData = {
    title: data.data.title,
    description: data.data.description,
    status: data.data.status
  };

  if (data.data.categories) {
    const catArr = data.data.categories.split(",").map(item => item.trim());
    postData.categories = catArr;
  }
  if (data.data.assignee)  postData.assignee = data.data.assignee;
  if (data.data.startDate) postData.startDate = data.data.startDate;
  if (data.data.endDate)   postData.endDate = data.data.endDate;

  $.ajax({
    url: `${API_URL}/tasks`,
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    data: JSON.stringify(postData),
    contentType: "application/json",
    success: function(res) {
      alert("Görev eklendi!");
      reloadTasks();
    },
    error: function(err) {
      console.error(err);
      alert("Görev eklenirken hata oluştu!");
    }
  });
}

// Görev güncelleme
function updateTask(data, taskId) {
  const token = localStorage.getItem('token');

  const putData = {
    title: data.data.title,
    description: data.data.description,
    status: data.data.status
  };
  if (data.data.categories) {
    const catArr = data.data.categories.split(",").map(item => item.trim());
    putData.categories = catArr;
  }
  if (data.data.assignee)  putData.assignee = data.data.assignee;
  if (data.data.startDate) putData.startDate = data.data.startDate;
  if (data.data.endDate)   putData.endDate = data.data.endDate;

  $.ajax({
    url: `${API_URL}/tasks/${taskId}`,
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    data: JSON.stringify(putData),
    contentType: "application/json",
    success: function(res) {
      alert("Görev güncellendi!");
      reloadTasks();
    },
    error: function(err) {
      console.error(err);
      alert("Görev güncellenirken hata oluştu!");
    }
  });
}

$(document).ready(function(){
  // DataTable init
  tasksTable = $('#tasksTable').DataTable();

  // Tablodaki butonlara tıklama eventleri
  $('#tasksTable tbody').on('click', '.btn-edit', function(){
    const taskId = $(this).data('id');
    const token = localStorage.getItem('token');

    $.ajax({
      url: `${API_URL}/tasks/${taskId}`,
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      success: function(task) {
        // categories alanını virgülle birleştiriyoruz
        const categoriesStr = (task.categories || []).map(cat => cat._id).join(", ");
        const surveyData = {
          title: task.title,
          description: task.description,
          categories: categoriesStr,
          status: task.status,
          assignee: task.assignee ? task.assignee._id : "",
          startDate: task.startDate ? task.startDate.split('T')[0] : "",
          endDate: task.endDate ? task.endDate.split('T')[0] : ""
        };
        showSurvey(surveyData, (data) => updateTask(data, taskId));
      },
      error: function(err) {
        console.error(err);
        alert("Görev bilgisi alınamadı!");
      }
    });
  });

  $('#tasksTable tbody').on('click', '.btn-delete', function(){
    const taskId = $(this).data('id');
    const token = localStorage.getItem('token');
    if (confirm("Görevi silmek istediğinize emin misiniz?")) {
      $.ajax({
        url: `${API_URL}/tasks/${taskId}`,
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        success: function(res) {
          alert(res.message);
          reloadTasks();
        },
        error: function(err) {
          console.error(err);
          alert("Görev silinirken hata oluştu!");
        }
      });
    }
  });

  // "Yeni Görev Ekle" butonu
  $('#btn-new-task').on('click', function(){
    showSurvey(null, createTask);
  });

  // "Filtrele" butonu
  $('#btnFilter').on('click', function(){
    reloadTasks();
  });

  // Sayfa yüklenince ilk seferde tüm görevleri çekelim
  reloadTasks();
});
