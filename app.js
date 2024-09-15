// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  set,
  update,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {

    apiKey: "AIzaSyCtLpbWHZmZn3dCOILpt7JnWbj-KDqviGs",
  
    authDomain: "dear-21512.firebaseapp.com",
  
    projectId: "dear-21512",
  
    storageBucket: "dear-21512.appspot.com",
  
    messagingSenderId: "722019212853",
  
    appId: "1:722019212853:web:646c85a21e5d1715015b7c",
  
    measurementId: "G-GQL33WTE0B",

    databaseURL: "https://dear-21512-default-rtdb.asia-southeast1.firebasedatabase.app",
  
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// // Get a reference to the database service
const db = getDatabase(app);

// DOM Elements
const rsvpForm = document.getElementById('rsvp-form');
const rsvpList = document.getElementById('rsvp-list');
const cancelUpdateBtn = document.getElementById('cancel-update');

// Current Editing Unique ID
let currentEditId = null;

// Fetch and Display RSVPs
function fetchRSVPs() {
    const rsvpRef = ref(db, 'rsvps/');
    onValue(rsvpRef, (snapshot) => {
        rsvpList.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const rsvp = childSnapshot.val();
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${childSnapshot.key}</td>
                <td>${rsvp.name}</td>
                <td>${rsvp?.willJoin == "true" ? 'Yes' : (rsvp?.willJoin == "false" ? 'No' : 'Unanswered')}</td>
                <td>${rsvp.numberOfGuest}</td>
                <td>${rsvp.email}</td>
                <td>${rsvp.pronoun}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${childSnapshot.key}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${childSnapshot.key}">Delete</button>
                </td>
                <td><a href="${'https://wedding-invite.phuocnghi.live/' + childSnapshot.key}">link</a></td>
            `;

            rsvpList.appendChild(tr);
        });
    });
}

// Add or Update RSVP
rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const willJoin= document.querySelector('input[name="willJoin"]:checked').value;

    const numberOfGuest = parseInt(document.getElementById('numberOfGuest').value, 10);
    const email = document.getElementById('email').value.trim();
    const pronoun = document.getElementById('pronoun').value.trim();

    let rsvpData = {
        name,
        numberOfGuest,
        email,
        pronoun,
        willJoin,
    };

    if (currentEditId) {
        // Update existing RSVP
        const rsvpRef = ref(db, 'rsvps/' + currentEditId);
        update(rsvpRef, rsvpData)
            .then(() => {
                alert('RSVP updated successfully!');
                rsvpForm.reset();
                currentEditId = null;
                cancelUpdateBtn.classList.add('hidden');
            })
            .catch((error) => {
                console.error("Error updating RSVP: ", error);
            });
    } else {
        // Add new RSVP
        const rsvpRef = ref(db, 'rsvps/');
        push(rsvpRef, rsvpData)
            .then(() => {
                alert('RSVP added successfully!');
                rsvpForm.reset();
            })
            .catch((error) => {
                console.error("Error adding RSVP: ", error);
            });
    }
});

// Handle Edit and Delete Actions
rsvpList.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
        const docId = e.target.getAttribute('data-id');
        const rsvpRef = ref(db, 'rsvps/' + docId);

        
        onValue(rsvpRef, (snapshot) => {
            if (snapshot.exists()) {
                const rsvp = snapshot.val();

                // fill guest name and pronoun
                document.querySelectorAll(".guest-name").forEach((element) => {
                    element.textContent = rsvp.name;
                });
                document.querySelectorAll(".guest-pronoun").forEach((element) => {
                    element.textContent = rsvp.pronoun;
                });

                // generate qr code
                document.getElementById('qrcode').innerHTML = '';
                var qrcode = new QRCode(document.getElementById("qrcode"), {
                    text: "https://wedding-invite.phuocnghi.live/" + docId,
                    width: 80,
                    height: 80,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                  })
                
                  // fill rsvp form
                document.getElementById('name').value = rsvp.name;
                if (rsvp?.willJoin == "true") {
                    document.getElementById('joinYes').checked = true;
                } else if (rsvp?.willJoin == "false") {
                    document.getElementById('joinNo').checked = true;
                } else {
                    document.getElementById('joinMaybe').checked = true;
                }
                document.getElementById('numberOfGuest').value = rsvp.numberOfGuest;
                document.getElementById('email').value = rsvp.email;
                document.getElementById('pronoun').value = rsvp.pronoun;
                currentEditId = docId;
                cancelUpdateBtn.classList.remove('hidden');
            }
        }, {
            onlyOnce: true
        });
    }

    if (e.target.classList.contains('delete-btn')) {
        const docId = e.target.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this RSVP?')) {
            const rsvpRef = ref(db, 'rsvps/' + docId);
            remove(rsvpRef)
                .then(() => {
                    alert('RSVP deleted successfully!');
                })
                .catch((error) => {
                    console.error("Error deleting RSVP: ", error);
                });
        }
    }
});

// Cancel Update
cancelUpdateBtn.addEventListener('click', () => {
    rsvpForm.reset();
    currentEditId = null;
    cancelUpdateBtn.classList.add('hidden');
});

// Initialize
fetchRSVPs();