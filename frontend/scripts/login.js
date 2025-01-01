Survey.StylesManager.applyTheme("modern");

const loginJson = {
  title: "Giriş Yap",
  elements: [
    {
      type: "text",
      name: "email",
      title: "E-mail",
      isRequired: true
    },
    {
      type: "text",
      name: "password",
      title: "Şifre",
      isRequired: true,
      inputType: "password"  // Add this line
    }
  ]
};

function sendLoginData(data) {
  const postData = data.data; // { username: '...', password: '...' }
  $.ajax({
    url: `${API_URL}/auth/login`,
    method: "POST",
    data: JSON.stringify(postData),
    contentType: "application/json",
    success: function(res) {
      alert(res.message);
      if (res.token) {
        // Token'ı sakla
        localStorage.setItem('token', res.token);
        // Anasayfaya veya tasks.html'e yönlendirelim
        window.location.href = 'index.html';
      }
    },
    error: function(err) {
      console.error(err);
      alert("Giriş başarısız! Hatalı kullanıcı adı veya şifre.");
    }
  });
}

const survey = new Survey.Model(loginJson);
survey.onComplete.add(sendLoginData);

$(document).ready(function() {
  $("#surveyElement").Survey({ model: survey });
});
