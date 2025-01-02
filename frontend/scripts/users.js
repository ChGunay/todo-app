Survey.StylesManager.applyTheme("modern");

let usersTable;
let surveyModal;

const createUserSurveyJson = {
  title: "Yeni Kullanıcı Ekle",
  elements: [
    {
      type: "text",
      name: "email",
      title: "Email",
      isRequired: true
    },
    {
      type: "text",
      name: "password",
      title: "Parola",
      isRequired: true,
      inputType: "password"
    },
    {
      type: "dropdown",
      name: "role",
      title: "Rol",
      isRequired: true,
      defaultValue: "user",
      choices: [
        { value: "user", text: "User" },
        { value: "admin", text: "Admin" }
      ]
    }
  ],
  showQuestionNumbers: false,
  completeText: "Kaydet",
  showPreviewBeforeComplete: "showAnsweredQuestions"
};

const updateUserSurveyJson = {
  title: "Kullanıcı Güncelle",
  elements: [
    {
      type: "text",
      name: "password",
      title: "Yeni Parola (opsiyonel)",
      inputType: "password"
    },
    {
      type: "dropdown",
      name: "role",
      title: "Rol (opsiyonel)",
      choices: [
        { value: "", text: "Değiştirme" },
        { value: "user", text: "User" },
        { value: "admin", text: "Admin" }
      ]
    }
  ],
  showQuestionNumbers: false,
  completeText: "Güncelle",
  showPreviewBeforeComplete: "showAnsweredQuestions"
};

/**
 * Sunucudan kullanıcı listesini alır ve tabloya doldurur.
 * @param {Object} filters Filtre objesi (email, role vs.)
 */
function reloadUsers(filters = {}) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Önce giriş yapmalısınız!");
    window.location.href = 'login.html';
    return;
  }

  let queryString = "";
  if (filters.email) {
    queryString += `email=${encodeURIComponent(filters.email)}&`;
  }
  if (filters.role) {
    queryString += `role=${encodeURIComponent(filters.role)}&`;
  }

  $.ajax({
    url: `${API_URL}/users?${queryString}`,
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    success: function(res) {
      usersTable.clear();
      res.forEach(user => {
        usersTable.row.add([
          user.email,
          user.role,
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

function createUser(data) {
  const token = localStorage.getItem('token');
  const postData = {
    email: data.data.email,
    password: data.data.password,
    role: data.data.role
  };

  $.ajax({
    url: `${API_URL}/users`,
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    data: JSON.stringify(postData),
    contentType: "application/json",
    success: function(res) {
      alert(res.message);
      reloadUsers();
    },
    error: function(err) {
      console.error(err);
      alert("Kullanıcı oluşturulurken hata oluştu!");
    }
  });
}

function updateUser(data, userId) {
  const token = localStorage.getItem('token');
  const putData = {};

  if (data.data.password) {
    putData.password = data.data.password;
  }
  if (data.data.role) {
    putData.role = data.data.role;
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

function showSurveyDialog(surveyJson, title, onComplete, existingData = null) {
  const modalElement = document.getElementById('surveyModal');
  surveyModal = new bootstrap.Modal(modalElement);

  modalElement.querySelector('.modal-title').textContent = title;

  const survey = new Survey.Model(surveyJson);
  if (existingData) {
    survey.data = existingData;
  }

  survey.onComplete.add((result) => {
    onComplete(result);
    surveyModal.hide();
  });

  $("#surveyContainer").Survey({ model: survey });
  surveyModal.show();

  modalElement.addEventListener('hidden.bs.modal', function () {
    $("#surveyContainer").empty();
  });
}

$(document).ready(function(){
  usersTable = $('#usersTable').DataTable();

  const socket = io(API_URL.replace('/api', ''), {}); 
  socket.on('connect', () => {
    console.log('Socket.IO sunucusuna bağlandı!', socket.id);
  });

  socket.on('userCreated', (newUser) => {
    console.log('userCreated event:', newUser);

    reloadUsers();
  });


  $('#usersTable tbody').on('click', '.btn-edit', function(){
    const userId = $(this).data('id');
    showSurveyDialog(updateUserSurveyJson, "Kullanıcı Güncelle", (surveyData) => {
      updateUser(surveyData, userId);
    });
  });

  $('#usersTable tbody').on('click', '.btn-delete', function(){
    const userId = $(this).data('id');
    deleteUser(userId);
  });

  $('#btnSearch').on('click', function(){
    const emailVal = $('#searchEmail').val().trim();
    const roleVal = $('#searchRole').val().trim();
    reloadUsers({ email: emailVal, role: roleVal });
  });

  $('#btnNewUser').on('click', function(){
    showSurveyDialog(createUserSurveyJson, "Yeni Kullanıcı Ekle", createUser);
  });


  reloadUsers();
});
