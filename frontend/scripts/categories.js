
Survey.StylesManager.applyTheme("modern");

let categoriesTable;

const categorySurveyJson = {
  title: "Kategori Formu",
  elements: [
    {
      type: "text",
      name: "name",
      title: "Kategori İsmi",
      isRequired: true
    }
  ],
  showQuestionNumbers: false
};

function showSurvey(data, callback) {
  $("#surveyContainer").remove();
  
  const surveyContainer = $('<div>', {
    id: 'surveyContainer',
    class: 'modal fade',
    tabindex: '-1',
    role: 'dialog'
  }).append(
    $('<div>', {
      class: 'modal-dialog',
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

  $('body').append(surveyContainer);

  const survey = new Survey.Model(categorySurveyJson);
  
  if (data) {
    survey.data = data;
  }

  survey.onComplete.add((surveyData) => {
    callback(surveyData);
    $("#surveyContainer").modal('hide');
  });

  $("#surveyElement").Survey({ model: survey });
  $("#surveyContainer").modal('show');
}

function reloadCategories() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Önce giriş yapmalısınız!");
    window.location.href = 'login.html';
    return;
  }

  const nameFilter = $("#filterCategoryName").val().trim();
  let queryString = nameFilter ? `?name=${encodeURIComponent(nameFilter)}` : '';

  $.ajax({
    url: `${API_URL}/categories${queryString}`,
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    success: function(res) {
      categoriesTable.clear();
      res.forEach(cat => {
        categoriesTable.row.add([
          cat.name,
          `
            <button class="btn btn-sm btn-info btn-edit" data-id="${cat._id}">Düzenle</button>
            <button class="btn btn-sm btn-danger btn-delete" data-id="${cat._id}">Sil</button>
          `
        ]);
      });
      categoriesTable.draw();
    },
    error: function(err) {
      console.error(err);
      alert("Kategoriler getirilemedi!");
    }
  });
}

function createCategory(data) {
  const token = localStorage.getItem('token');
  const postData = { name: data.data.name };
  $.ajax({
    url: `${API_URL}/categories`,
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    data: JSON.stringify(postData),
    contentType: "application/json",
    success: function(res) {
      alert("Kategori eklendi!");
      reloadCategories();
    },
    error: function(err) {
      console.error(err);
      alert("Kategori eklenirken hata oluştu!");
    }
  });
}

function updateCategory(data, categoryId) {
  const token = localStorage.getItem('token');
  const putData = { name: data.data.name };
  $.ajax({
    url: `${API_URL}/categories/${categoryId}`,
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    data: JSON.stringify(putData),
    contentType: "application/json",
    success: function(res) {
      alert("Kategori güncellendi!");
      reloadCategories();
    },
    error: function(err) {
      console.error(err);
      alert("Kategori güncellenirken hata oluştu!");
    }
  });
}

$(document).ready(function(){
  // DataTable init
  categoriesTable = $('#categoriesTable').DataTable();

  // Delegation for edit/delete
  $('#categoriesTable tbody').on('click', '.btn-edit', function(){
    const categoryId = $(this).data('id');
    const token = localStorage.getItem('token');
    $.ajax({
      url: `${API_URL}/categories/${categoryId}`,
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      success: function(cat) {
        const surveyData = { name: cat.name };
        showSurvey(surveyData, (data) => updateCategory(data, categoryId));
      },
      error: function(err) {
        console.error(err);
        alert("Kategori bilgisi alınamadı!");
      }
    });
  });

  $('#categoriesTable tbody').on('click', '.btn-delete', function(){
    const categoryId = $(this).data('id');
    const token = localStorage.getItem('token');
    if (confirm("Kategoriyi silmek istediğinize emin misiniz?")) {
      $.ajax({
        url: `${API_URL}/categories/${categoryId}`,
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        success: function(res) {
          alert("Kategori silindi.");
          reloadCategories();
        },
        error: function(err) {
          console.error(err);
          alert("Kategori silinirken hata oluştu!");
        }
      });
    }
  });

  $('#btn-new-category').on('click', function(){
    showSurvey(null, createCategory);
  });

  $('#btnFilterCategory').on('click', function(){
    reloadCategories();
  });


  reloadCategories();
});
