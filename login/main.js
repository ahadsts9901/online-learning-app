const firebaseConfig = {
    apiKey: "AIzaSyCMng_8MwnzIoWiRS2_AyVyYMplV5QcE1c",
    authDomain: "students-management-syst-28aac.firebaseapp.com",
    projectId: "students-management-syst-28aac",
    storageBucket: "students-management-syst-28aac.appspot.com",
    messagingSenderId: "76794892993",
    appId: "1:76794892993:web:39ca0e90b1d98808343a40",
    measurementId: "G-G0PYS1MSLT"
};



// initialize firebase
firebase.initializeApp(firebaseConfig);

// logout automatically
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        window.location.href = "../home/index.html";
    }
});

// show Password
function showPassword(event) {
    event.target.className = "eye bi bi-eye-slash";
    event.target.previousElementSibling.type = "text";
    event.target.removeEventListener('click', showPassword);
    event.target.addEventListener('click', hidePassword);
}

// hide password
function hidePassword(event) {
    event.target.className = "eye bi bi-eye";
    event.target.previousElementSibling.type = "password";
    event.target.removeEventListener('click', hidePassword);
    event.target.addEventListener('click', showPassword);
}

function login(event) {
    event.preventDefault()
    let email = document.getElementById("email-login").value
    let password = document.getElementById("password-login").value
    let message = document.querySelector(".validationMessage");

    if (!(email.endsWith(".com"))) {
        message.innerText = `Invalid email address`;
        message.style.display = "block";
        message.style.color = "#e55865";
        return;
    }

    if (
        email.trim() === '' ||
        password.trim() === ''
        // || password.length > 8 || password.length < 4
    ) {
        message.innerText = `Please fill required fields`;
        message.style.display = "block";
        message.style.color = "#e55865";
        return;
    }

    // firebase

    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // console.log("Login successful");
            Swal.fire({
                icon: 'success',
                title: 'Logged In',
                text: 'Login Successfull',
                confirmButtonColor: "#18171F"
            })
            window.location.href = "";
        })
        .catch((error) => {
            console.error("Login error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Access Denied',
                text: 'Invalid email or password. Please enter correct credentials',
                confirmButtonColor: "#18171F"
            })
            // alert("Invalid email or password. Please enter correct credentials.");
        });

    document.getElementById("email-login").value
    document.getElementById("password-login").value
}