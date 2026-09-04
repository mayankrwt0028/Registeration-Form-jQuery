



let stateCities = {
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Noida"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
  Delhi: ["New Delhi", "Delhi"],
  Karnataka: ["Bangalore", "Mysore", "Mangalore"],
};

let users = JSON.parse(localStorage.getItem("users")) || []
let table;
let editId = null;

$("#resetBtn").on("click", function () {
  editId = null;
});

$(document).ready(function () {

 let today = new Date().toISOString().split("T")[0];
 $("#dob").attr("max", today);

 $("#name").on("input", function () {
  this.value = this.value.replace(/[^a-zA-Z ]/g, "");
});

 $("#aadhaar, #contact").on("input", function () {
  this.value = this.value.replace(/\D/g, "");
});
$("#contact").on("input", function () {
  this.value = this.value.replace(/\D/g, "").slice(0, 10);
});


  $("#registrationForm").validate({
    rules: {
      name: {
        required: true,
        minlength: 3,
      },
      contact: {
        required: true,
        digits: true,
        minlength: 10,
        maxlength: 10,
      },
      gender: {
        required: true,
      },
      aadhaar: {
        required: true,
        digits: true,
        minlength: 12,
        maxlength: 12,
      },
      dob: {
        required: true,
      },
      is18: {
        AgeCheck: true,
      },
      country: {
        required: true,
      },
      state: {
        required: true,
      },
      city: {
        required: true,
      },
      address: {
        required:true,
        minlength:10,
      }
    },

    messages: {
      name: {
        required: "name is required",
        minlength: "Name must be at least 3 character",
      },
      aadhaar: {
        required: "Aadhaar is required",
        digits: "Aadhaar must contain numbers only",
        minlength: "Aadhaar must be 12 digits",
        maxlength: "Aadhaar must be 12 digits",
      },
      contact: {
        required: "Contact is required",
        digits: "Contact must contain numbers only",
        minlength: "Contact must be 10 digits",
        maxlength: "Contact must be 10 digits",
      },
      gender: {
        required: "Please select gender",
      },
      dob: {
        required: "Please enter your age",
      },
      is18: {
        AgeCheck: "Your age must be 18+ to check this box",
      },
      country: {
        required: "Please select country",
      },
      state: {
        required: "Please select state",
      },
      city: {
        required: "Please select city",
      },
      address: {
        required: "Address is required",
        minlength: "Address must be more then 10 character"
      }
    },

  errorPlacement: function(error, element){
    if(element.attr("name") ==="is18"){
      error.insertAfter(element.next("label"))
    }else if(element.attr("name")==="gender"){
      error.appendTo(".gender-error")
    }else{
      error.insertAfter(element)
    }
  },

    submitHandler: function (form) {

      let user = {
        id: editId || Date.now(),
        name: $("#name").val(),
        aadhaar: $("#aadhaar").val(),
        contact: $("#contact").val(),
        dob: $("#dob").val(),
        is18: $("#is18").prop("checked"),
        gender: $("input[name='gender']:checked").val(),
        country: $("#country").val(),
        state: $("#state").val(),
        city: $("#city").val(),
        address: $("#address").val()
      };

     if(editId === null){
      users.push(user)
     }else{
      users = users.map(function(oldUser){
        if(oldUser.id === editId){
          return user
        }
        return oldUser
      })
     }

      localStorage.setItem("users", JSON.stringify(users))

      showUsers();

      form.reset();
      editId = null
    }
  });


  
  $.each(stateCities, function (stateName) {

    $("#state").append(
      `<option value="${stateName}">${stateName}</option>`
    );

  });



  $("#state").on("change", function () {

    let selectedState = $(this).val();

    $("#city").html('<option value="">Select City</option>');

    if (!selectedState) {
      return;
    }

    $.each(stateCities[selectedState], function (index, cityName) {

      $("#city").append(
        `<option value="${cityName}">${cityName}</option>`
      );

    });

  });



  table = $("#userTable").DataTable({
    paging:false,
    searching:false,
    info:false,

    columns: [
      {data:null,
        render: function(data, type, row, meta){
          return meta.row +1
        }
      },
      { data: "name" },
      { data: "aadhaar" },
      { data: "contact" },
      { data: "dob" },
      
      { data: "gender" },
      { data: "country" },
      { data: "state" },
      { data: "city" },
      {data: "address"},
      {data: null,
        render: function(data, type, row){
          return `
          <button class="deleteBtn" data-id="${row.id}">
          Delete
          </button>
          <button class="editBtn" data-id="${row.id}">
          Edit
          </button>
          
          `
        }
      }
    ]

  });
  showUsers()

});

$("#userTable").on("click", ".deleteBtn", function(){
  let id = Number($(this).data("id"))

  users = users.filter(function(user){
    return user.id !== id;
  })

  localStorage.setItem("users", JSON.stringify(users))
  showUsers()
})

$("#userTable").on("click", ".editBtn", function () {

  editId = Number($(this).data("id"));

  let user = users.find(function (user) {
    return user.id === editId;
  });

  $("#name").val(user.name);
  $("#aadhaar").val(user.aadhaar);
  $("#contact").val(user.contact);
  $("#dob").val(user.dob);

  $(`input[name="gender"][value="${user.gender}"]`)
    .prop("checked", true);

  $("#country").val(user.country);
  $("#state").val(user.state);

  $("#city").html(
    '<option value="">Select City</option>'
  );

  $.each(stateCities[user.state], function (index, cityName) {

    $("#city").append(
      `<option value="${cityName}">${cityName}</option>`
    );

  });

  $("#city").val(user.city);

  $("#address").val(user.address);

});


$.validator.addMethod(
  "AgeCheck",
  function (value, element) {
    if (!element.checked) {
      return true;
    }

    let dob = new Date($("#dob").val());
    let today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    let month = today.getMonth() - dob.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age >= 18;
  },
  "You must be at least 18 year old",
);




function showUsers(){
  table.clear()
  table.rows.add(users);
  table.draw()
}
