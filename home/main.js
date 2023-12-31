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
const db = firebase.firestore()

// logout automatically
firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
        window.location.href = "../login/index.html";
    } else {
        let username = user.email
        {
            db.collection("users")
                .get()
                .then((querySnapshot) => {
                    {
                        querySnapshot.forEach(function (doc) {
                            var data = doc.data();

                            if (data.email === username) {

                                // console.log(data.isAdmin);

                                if (data.isAdmin == true) {
                                    window.location.href = "../admin/index.html"
                                }

                                let names = document.getElementById("userName")
                                if (names) { names.innerText = `${data.firstName}  ${data.lastName}` }

                                let pic = document.querySelector(".userProfile")
                                if (pic) { pic.src = data.photo }

                                // console.log("founded")
                            }

                        })
                    }
                })
                .catch((error) => {
                    console.error("Error getting posts: ", error);
                });
        }
    }
});

function logout() {
    firebase
        .auth()
        .signOut()
        .then(() => {
            // console.log("Sign out successful");
            // Redirect to the sign-in page or any other desired destination
            window.location.href = "../index.html";
        })
        .catch((error) => {
            console.error("Sign out error:", error);
        });
}

function editName() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            username = user.email;

            {
                db.collection("users")
                    .get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach(function (doc) {
                            var data = doc.data();

                            if (data.email === username) {
                                // Display SweetAlert input for editing FirstName and LastName
                                Swal.fire({
                                    title: 'Edit Profile',
                                    html: `<input id="swal-input-firstname" class="swal2-input" placeholder="First Name" value="${data.firstName || ''}">
                           <input id="swal-input-lastname" class="swal2-input" placeholder="Last Name" value="${data.lastName || ''}">`,
                                    focusConfirm: false,
                                    showCancelButton: true,
                                    cancelButtonColor: "#18171F",
                                    confirmButtonColor: "#18171F",
                                    preConfirm: () => {
                                        const newFirstName = document.getElementById('swal-input-firstname').value;
                                        const newLastName = document.getElementById('swal-input-lastname').value;

                                        // Validate if inputs are not empty
                                        if (!newFirstName.trim() || !newLastName.trim()) {
                                            Swal.showValidationMessage('Please fill in both First Name and Last Name.');
                                        } else {
                                            // Update the values on the front end
                                            data.firstName = newFirstName;
                                            data.lastName = newLastName;
                                        }
                                    }
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        // Update the Firestore document after confirming
                                        db.collection("users").doc(doc.id).update({
                                            firstName: data.firstName,
                                            lastName: data.lastName
                                        }).then(() => {
                                            // console.log("Profile updated successfully!");
                                            Swal.fire({
                                                icon: 'success',
                                                title: 'Profile Updated',
                                                showConfirmButton: false,
                                                timer: 1500 // Show success message for 1.5 seconds
                                            });
                                            setTimeout(() => {
                                                window.location.reload()
                                            }, 1000)
                                        }).catch((error) => {
                                            console.error("Error updating profile: ", error);
                                            Swal.fire({
                                                icon: 'error',
                                                title: `Can't update`,
                                                showConfirmButton: false,
                                                timer: 1500 // Show success message for 1.5 seconds
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    })
                    .catch((error) => {
                        console.error("Error getting posts: ", error);
                    });


            }

        } else {
            window.location.href = "./all.html";
        }
    });

}

function file(event) {
    // console.log(event.target.files[0])
    let uid = firebase.auth().currentUser.uid
    // console.log(uid)
    let fileref = firebase.storage().ref().child(`/users/${uid}/profile`)
    let uploadTask = fileref.put(event.target.files[0])

    uploadTask.on('state_changed',
        (snapshot) => {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // console.log('Upload is ' + progress + '% done');
            if (progress == 100) {
                Swal.fire({
                    icon: 'success',
                    title: 'Uploaded',
                    showConfirmButton: false,
                    timer: 1000 // Show success message for 1.5 seconds
                });
            }
        },
        (error) => {
            console.error(error)
        },
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                // console.log('File available at', downloadURL);

                // Update the photo field in the user's document in Firestore
                db.collection("users").where("email", "==", firebase.auth().currentUser.email)
                    .get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            db.collection("users").doc(doc.id).update({
                                photo: downloadURL
                            }).then(() => {
                                // console.log("Photo URL updated in Firestore.");
                                setTimeout(() => {
                                    window.location.reload()
                                })
                            }).catch((error) => {
                                console.error("Error updating photo URL:", error);
                            });
                        });
                    })
                    .catch((error) => {
                        console.error("Error querying Firestore:", error);
                    });

                firebase.auth().currentUser.updateProfile({
                    photoURL: downloadURL
                })
            });
        }
    );

}

function renderProducts() {

    var container = document.querySelector(".products")
    container.innerHTML = "";

    db.collection("products")
        .get()
        .then(function (querySnapshot) {
            if (querySnapshot.size === 0) {
                container.innerHTML = "<div class='blue'>No Product found</div>";
            } else {
                querySnapshot.forEach(function (doc) {

                    var data = doc.data();

                    // console.log(data)

                    let product = document.createElement("div")
                    product.className += "flex justify-between items-center gap-[1em] p-[0.5em] w-[100%]"

                    let image = document.createElement("img")
                    image.className += "product w-[7em] h-[5em] rounded-[15px] object-cover"
                    image.src = data.image

                    let cont = document.createElement("div")
                    cont.className += "flex flex-col justify-right items-start w-[100%]"

                    let title = document.createElement("p")
                    title.className += "font-bold text-[1em]"
                    title.innerText = data.name
                    cont.appendChild(title)

                    let desc = document.createElement("p")
                    desc.className += "font-bold text-[0.7em] text-[#888]"
                    desc.innerText = data.description
                    cont.appendChild(desc)

                    let smcont = document.createElement("div")
                    smcont.className += "flex flex-col justify-right items-end w-[5em] h-[100%] gap-[1em]"

                    let det = document.createElement("p")
                    det.className += "text-[0.8em] text-[#212121] self-end"
                    det.innerText = `${data.price} - ${data.unit}`
                    smcont.appendChild(det)

                    let plus = document.createElement("span")
                    plus.className += "w-[3em] h-[1.5em] bg-[#18171F] rounded-[5px] text-[#fff] flex justify-center items-center"
                    plus.addEventListener("click", function () {
                        localStorage.setItem("enrollId", doc.id)
                        window.location.href = "./cart.html"
                    })
                    smcont.appendChild(plus)

                    let icon = document.createElement("p")
                    icon.className += "text-[#fff] p-[0.5em] text-[0.6em]"
                    icon.innerText = "Enroll"
                    plus.appendChild(icon)


                    product.appendChild(image)
                    product.appendChild(cont)
                    product.appendChild(smcont)

                    container.appendChild(product)

                });
            }
        })
        .catch(function (error) {
            console.error("Error getting documents: ", error);
        });

}

function enroll(event) {

    event.preventDefault()

    let courseId = localStorage.getItem("enrollId")

    let name = document.querySelector("#nameInput").value
    let number = document.querySelector("#numberInput").value
    let address = document.querySelector("#addressInput").value
    let age = document.querySelector("#age").value
    let qualification = document.querySelector("#qualification").value
    let courseName = localStorage.getItem("name")
    let userEmail = firebase.auth().currentUser.email

    let student = {
        name: name,
        number: number,
        address: address,
        age: age,
        qualification: qualification,
        userEmail: userEmail,
        courseName: courseName
    }

    db.collection("enrolls")
        .add(student)
        .then(docRef => {

            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            })

            Toast.fire({
                icon: 'success',
                title: 'Enrolled Sucessfully'
            })

            event.target.reset()
            localStorage.setItem("enrollId", "")

            setTimeout(() => {
                window.location.reload()
            }, 2000)

        })
        .catch(error => {
            console.error("Error adding order: ", error);
        });

}

document.addEventListener("DOMContentLoaded", function () {
   try{
    renderProducts()
   }catch{
    userCourses()
   }
});


let courseId = localStorage.getItem("enrollId")
console.log(courseId);

var container = document.querySelector(".enroll");
container.innerHTML = "";

db.collection("products")
    .get()
    .then(function (querySnapshot) {
        if (querySnapshot.size === 0) {
            container.innerHTML = "<div class='blue'>No course found</div>";
        } else {
            querySnapshot.forEach(function (doc) {
                if (courseId === doc.id) {
                    var data = doc.data();
                    console.log(data);

                    localStorage.setItem("name", data.name)

                    let product = document.createElement("div");
                    product.className += "flex flex-col justify-start items-start gap-[1em] p-[0.5em] w-[100%] border-[1px] border-[#18171F] rounded-[10px]";

                    let title = document.createElement("p");
                    title.className += "courseName font-bold text-[2em] w-[100%] text-left";
                    title.innerText = data.name;

                    let desc = document.createElement("p");
                    desc.className += "w-[100%] text-left text-[#888]";
                    desc.innerText = data.description;

                    let fee = document.createElement("p");
                    fee.className += "w-[100%] text-left text-[1em]";
                    fee.innerText = `Fee: ${data.price}`;

                    let div = document.createElement("div");
                    div.className += "w-[100%] flex justify-left items-center gap-[2em]";

                    let edit = document.createElement("p");
                    edit.className += "text-[#888]";
                    div.appendChild(edit);

                    let del = document.createElement("p");
                    del.className += "text-[#888]";
                    div.appendChild(del);

                    product.appendChild(title);
                    product.appendChild(desc);
                    product.appendChild(fee);
                    product.appendChild(div);
                    container.appendChild(product);
                }
            });
        }
    })
    .catch(function (error) {
        console.error("Error getting documents: ", error);
    });