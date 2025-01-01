/**
 * Register sayfasındaki SurveyJS formu
 */
Survey.StylesManager.applyTheme("modern");

const registerJson = {
  title: "Kayıt Ol",
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

function sendRegisterData(data) {
  const postData = data.data; // { username: '...', password: '...' }
  $.ajax({
    url: `${API_URL}/auth/register`,
    method: "POST",
    data: JSON.stringify(postData),
    contentType: "application/json",
    success: function(res) {
      alert(res.message);
      // Başarılı kayıt sonrası login sayfasına yönlendirelim
      window.location.href = 'login.html';
    },
    error: function(err) {
      console.error(err);
      alert("Kayıt başarısız! Kullanıcı adı zaten alınmış olabilir veya başka bir hata oluştu.");
    }
  });
}

const survey = new Survey.Model(registerJson);
survey.onComplete.add(sendRegisterData);

$(document).ready(function() {
  $("#surveyElement").Survey({ model: survey });
});
