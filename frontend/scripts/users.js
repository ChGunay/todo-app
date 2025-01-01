/**
 * Kullanıcılar sayfası:
 * - DataTables ile listeleme
 * - Her kullanıcı satırında silme ve şifre güncelleme
 */
Survey.StylesManager.applyTheme("modern");

let usersTable;

const userUpdateSurveyJson = {
  title: "Kullanıcı Güncelle",
  elements: [
    {
      type: "password",
      name: "password",
      title: "Yeni Şifre (Opsiyonel)"
    }
  ]
};

function reloadUsers() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Önce giriş yapmalısınız!");
    window.location.href = 'login.html';
    return;
  }
  $.ajax({
    url: `${API_URL}/users`,
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    success: function(res) {
      usersTable.clear();
      res.forEach(user => {
        usersTable.row.add([
          user.email,
          new Date(user.createdAt).toLocaleString(),
          `
            <button class="btn btn-sm btn-info btn-edit" data-id="${user._id}">Güncelle</button>
            <button class="btn btn-sm btn-danger btn-delete" data-id="${user._id}">Sil</button>
          `
        ]);
      });
      usersTable.draw();
    },
    error: function(err) {
      console.error(err);
      alert("Kullanıcılar getirilemedi!");
    }
  });
}

function updateUser(data, userId) {
  const token = localStorage.getItem('token');
  const putData = {};
  if (data.data.password) {
    putData.password = data.data.password;
  }
  $.ajax({
    url: `${API_URL}/users/${userId}`,
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    data: JSON.stringify(putData),
    contentType: "application/json",
    success: function(res) {
      alert(res.message);
      reloadUsers();
    },
    error: function(err) {
      console.error(err);
      alert("Kullanıcı güncellenirken hata oluştu!");
    }
  });
}

function deleteUser(userId) {
  const token = localStorage.getItem('token');
  if (confirm("Kullanıcıyı silmek istediğinize emin misiniz?")) {
    $.ajax({
      url: `${API_URL}/users/${userId}`,
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      success: function(res) {
        alert(res.message);
        reloadUsers();
      },
      error: function(err) {
        console.error(err);
        alert("Kullanıcı silinirken hata oluştu!");
      }
    });
  }
}

$(document).ready(function(){
  usersTable = $('#usersTable').DataTable();

  $('#usersTable tbody').on('click', '.btn-edit', function(){
    const userId = $(this).data('id');
    const survey = new Survey.Model(userUpdateSurveyJson);
    survey.onComplete.add((data) => updateUser(data, userId));
    const surveyWindow = new Survey.SurveyWindow(survey);
    surveyWindow.show();
  });

  $('#usersTable tbody').on('click', '.btn-delete', function(){
    const userId = $(this).data('id');
    deleteUser(userId);
  });

  // sayfa yüklenince yükle
  reloadUsers();
});