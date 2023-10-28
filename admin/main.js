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


                                document.querySelector("#userName").innerText = `${data.firstName} ${data.lastName}`

                                document.querySelector(".userProfile").src = data.photo

                                if (data.isAdmin == false) {
                                    window.location.href = "../home/index.html"
                                }

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

function addProduct(e) {

    e.preventDefault();

    let fileImg = e.target.querySelector("#productImg")

    let d = new Date();
    let time = d.getTime();
    // console.log(time);
    let fileref = firebase.storage().ref().child(`/admin/products/${time}`);

    // console.log(fileImg.files[0]);

    let uploadTask = fileref.put(fileImg.files[0]);

    uploadTask.on('state_changed',
        (snapshot) => {
            // console.log(snapshot);
        },
        (error) => {
            console.error(error);
        },
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {

                // add product

                let productImage = downloadURL
                let productName = document.querySelector("#itemName").value
                let productCategory = document.querySelector("#category").value
                let productDesc = document.querySelector("#description").value
                let productPrice = document.querySelector("#price").value
                let productUnit = document.querySelector("#unit").value

                setTimeout(() => {

                    db.collection("products")
                        .add({
                            image: productImage,
                            name: productName,
                            category: productCategory,
                            description: productDesc,
                            price: productPrice,
                            unit: productUnit
                        })
                        .then(function (docRef) {

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
                                title: 'Added successfully'
                            })

                            // console.log("Added");

                        })
                        .catch(function (error) {
                            console.error("Error adding document: ", error);
                        });

                }, 0)

                e.target.reset()

            });
        }
    );

}

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

    var container = document.querySelector(".adminProducts")
    container.innerHTML = "";

    db.collection("products")
        .get()
        .then(function (querySnapshot) {
            if (querySnapshot.size === 0) {
                container.innerHTML = "<div class='blue'>No course found</div>";
            } else {
                querySnapshot.forEach(function (doc) {

                    var data = doc.data();

                    // console.log(data)

                    let product = document.createElement("div")
                    product.className += "flex justify-between items-center gap-[1em] p-[0.5em] w-[100%] border-[1px] border-[#18171F] rounded-[10px]"

                    let image = document.createElement("img")
                    image.className += "product w-[6em] h-[4em] rounded-[15px] object-cover"
                    image.src = data.image

                    let title = document.createElement("p")
                    title.className += "font-bold text-[1em] w-[100%] text-left"
                    title.innerText = data.name

                    let det = document.createElement("p")
                    det.className += "text-[#212121] pr-[1em]"
                    det.innerText = "See More"
                    det.href = "course.html"

                    det.addEventListener("click", function (event) {
                        event.preventDefault(); // Prevent the default link behavior to avoid navigating away immediately
                        localStorage.setItem("courseId", doc.id)
                        const docId = det.getAttribute("data-doc-id"); // Retrieve the document ID
                        window.location.href = det.href;
                    });

                    product.appendChild(image)
                    product.appendChild(title)
                    product.appendChild(det)

                    container.appendChild(product)

                });
            }
        })
        .catch(function (error) {
            console.error("Error getting documents: ", error);
        });

}

function adminOrders() {

    var container = document.querySelector(".adminOrders");
    container.innerHTML = "";

    db.collection("enrolls")
        .get()
        .then(function (querySnapshot) {
            if (querySnapshot.size === 0) {
                container.innerHTML = "<div class='blue'>No enrolls found</div>";
            } else {
                querySnapshot.forEach(function (doc) {
                    var data = doc.data();

                    console.log(data);

                    let product = document.createElement("div")
                    product.className += "flex flex-col justify-between items-start gap-[1em] border-b-[1px] border-[#ccc] p-[0.5em] w-[100%]"

                    let head = document.createElement("div")
                    head.className += "flex justify-between items-center gap-[1em] w-[100%]"

                    let orderName = document.createElement("p")
                    orderName.className += "text-[#212121] text-left text-[1.5em]"
                    orderName.innerText = "Name: " + data.name

                    let cont = document.createElement("div")
                    cont.className += "flex flex-col justify-right items-start w-[fit-content]"

                    let body = document.createElement("div")
                    body.className += "flex flex-col justify-start items-start gap-[0.5em]"

                    let age = document.createElement("p")
                    age.className += "w-[100%] text-left text-[#212121]"
                    age.innerText = "Age: " + data.age

                    let course = document.createElement("p")
                    course.className += "w-[100%] text-left text-[#212121]"
                    course.innerText = "Course Name: " + data.courseName

                    let gml = document.createElement("p")
                    gml.className += "w-[100%] text-left text-[#212121]"
                    gml.innerText = "Email: " + data.userEmail

                    let num = document.createElement("p")
                    num.className += "w-[100%] text-left text-[#212121]"
                    num.innerText = "Contact: " + data.number

                    let qualification = document.createElement("p")
                    qualification.className += "w-[100%] text-left text-[#212121]"
                    qualification.innerText = "Qualification: " + data.qualification

                    let address = document.createElement("p")
                    address.className += "w-[100%] text-left text-[#212121]"
                    address.innerText = "Address: " + data.address

                    let del = document.createElement("p")
                    del.className += "w-[100%] text-left text-[#888] text=[0.8em]"
                    del.innerText = "Delete"
                    del.addEventListener("click", function () {
                        delDoc(doc.id)
                    })

                    function delDoc(docId) {

                        Swal.fire({
                            title: 'Delete Course',
                            text: 'Are you sure you want to delete this course?',
                            showCancelButton: true,
                            confirmButtonText: 'Delete',
                            cancelButtonText: 'Cancel',
                            confirmButtonColor: '#212121',
                            cancelButtonColor: '#212121',
                        }).then((result) => {
                            if (result.isConfirmed) {
                                Swal.fire({
                                    icon: "success",
                                    title: "Deleted",
                                    confirmButtonText: "OK",
                                    confirmButtonColor: "#212121",
                                });

                                db.collection("enrolls").doc(docId).delete();
                            }

                            setTimeout(() => {
                                window.location.reload()
                            }, 2000)

                        });

                    }


                    body.appendChild(age)
                    body.appendChild(course)
                    body.appendChild(gml)
                    body.appendChild(num)
                    body.appendChild(qualification)
                    body.appendChild(address)
                    body.appendChild(del)


                    head.appendChild(cont)
                    cont.appendChild(orderName)

                    product.appendChild(head)
                    product.appendChild(body)

                    container.appendChild(product)



                });
            }
        })
        .catch(function (error) {
            console.error("Error getting documents: ", error);
        });

}

function renderCourse(courseId) {
    console.log(courseId);

    var container = document.querySelector(".course");
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

                        let product = document.createElement("div");
                        product.className += "flex flex-col justify-start items-start gap-[1em] p-[0.5em] w-[100%] border-[1px] border-[#18171F] rounded-[10px]";

                        let title = document.createElement("p");
                        title.className += "font-bold text-[2em] w-[100%] text-left";
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
                        edit.innerText = "Edit";
                        edit.addEventListener("click", function () {
                            editDoc(courseId)
                        })

                        function editDoc(docId) {
                            db.collection("products").doc(docId).get()
                                .then(function (doc) {
                                    if (doc.exists) {
                                        const data = doc.data();
                                        Swal.fire({
                                            title: 'Edit Course',
                                            html: `<input  minlength="1" maxlength="20" id="swal-input1" class="swal2-input" placeholder="Course Name" value="${data.name}">` +
                                                `<input minlength="10"
                                                maxlength="300" id="swal-input2" class="swal2-input" placeholder="Description" value="${data.description}">` +
                                                `<input min="1" max="200000" id="swal-input3" class="swal2-input" placeholder="Fees" value="${data.price}">`,
                                            showCancelButton: true,
                                            confirmButtonText: 'Update',
                                            cancelButtonText: 'Cancel',
                                            confirmButtonColor: '#212121',
                                            cancelButtonColor: '#212121',
                                            preConfirm: () => {
                                                // Validate and process user input
                                                const newName = Swal.getPopup().querySelector('#swal-input1').value;
                                                const newDesc = Swal.getPopup().querySelector('#swal-input2').value;
                                                const newPrice = Swal.getPopup().querySelector('#swal-input3').value;
                                                if (!newName || !newDesc || !newPrice) {
                                                    Swal.showValidationMessage('All fields are required');
                                                }

                                                return db.collection("products").doc(docId).update({
                                                    name: newName,
                                                    description: newDesc,
                                                    price: newPrice
                                                });
                                            }
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                Swal.fire({
                                                    icon: "success",
                                                    title: "Updated",
                                                    confirmButtonText: "OK",
                                                    confirmButtonColor: "#212121",
                                                });
                                                setTimeout(() => {
                                                    window.location.reload()
                                                }, 2000)
                                            }
                                        }).catch((error) => {
                                            console.error("Error updating document: ", error);
                                            Swal.fire('Error Updating Course', '', 'error');
                                        });
                                    } else {
                                        console.error("Document not found");
                                        Swal.fire('Error', 'Course not found', 'error');
                                    }
                                })
                                .catch(function (error) {
                                    console.error("Error getting document: ", error);
                                });
                        }


                        div.appendChild(edit);

                        let del = document.createElement("p");
                        del.className += "text-[#888]";
                        del.innerText = "Delete";
                        del.addEventListener("click", function () {
                            delDoc(courseId)
                        })

                        function delDoc(docId) {

                            Swal.fire({
                                title: 'Delete Course',
                                text: 'Are you sure you want to delete this course?',
                                showCancelButton: true,
                                confirmButtonText: 'Delete',
                                cancelButtonText: 'Cancel',
                                confirmButtonColor: '#212121',
                                cancelButtonColor: '#212121',
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    Swal.fire({
                                        icon: "success",
                                        title: "Deleted",
                                        confirmButtonText: "OK",
                                        confirmButtonColor: "#212121",
                                    });

                                    db.collection("products").doc(docId).delete();
                                }

                                setTimeout(() => {
                                    window.location.href = "./index.html"
                                }, 3000)

                            });

                        }

                        div.appendChild(del);

                        console.log(data);

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
}

document.addEventListener("DOMContentLoaded", function () {
    try {
        renderProducts();
    } catch (error) {
        console.error('render products', error);
        try {
            adminOrders();
        } catch (error) {
            try {
                let courseId = localStorage.getItem("courseId")
                renderCourse(courseId)
            } catch (error) {
                console.log("course", error);
            }
        }
    }
});
