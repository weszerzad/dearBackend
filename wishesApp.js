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

  databaseURL:
    "https://dear-21512-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// // Get a reference to the database service
const db = getDatabase(app);

const postForm = document.getElementById('postForm');
const cancelUpdateBtn = document.getElementById('wishes-cancel-update');

// Current Editing Unique ID
let currentEditId = null;

// Function to add or update a post
async function addOrUpdatePost(postId, name, message, isShown) {
  try {
    if (postId) {
      // Update existing post
      const postRef = ref(db, "posts/" + postId);
      await update(postRef, {
        name: name,
        message: message,
        isShown: isShown,
        // dateTime: new Date().toISOString(),
      });
    } else {
      // Add new post
      const postListRef = ref(db, "posts");
      const newPostRef = push(postListRef);
      await set(newPostRef, {
        name: name,
        message: message,
        isShown: isShown,
        dateTime: new Date().toISOString(),
      });
    }
    loadPosts();
  } catch (e) {
    console.error("Error adding or updating document: ", e);
  }
}

// Function to load posts
async function loadPosts() {
  const postsTableBody = document.getElementById("posts");
  postsTableBody.innerHTML = "";
  const postsRef = ref(db, "posts");
  onValue(postsRef, (snapshot) => {
    postsTableBody.innerHTML = ""; // Clear the table body


    const dataArray = [];
    snapshot.forEach((childSnapshot) => {
        // const childData = childSnapshot.val();
        dataArray.push(childSnapshot);
    });

    // Sort the array by dateTime
    dataArray.sort((a, b) => {
        return new Date(b.val().dateTime) - new Date(a.val().dateTime);
    });


    dataArray.forEach((childSnapshot) => {
      const post = childSnapshot.val();
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${post.name}</td>
          <td>${post.message}</td>
          <td>${post.dateTime}</td>
          <td class="actions">
          <button class="edit edit-btn" data-id="${childSnapshot.key}">Edit</button>
          <button class="delete delete-btn" data-id="${childSnapshot.key}">Delete</button>
          </td>
          <td>${post.isShown}</td>
        `;
      postsTableBody.appendChild(row);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll(".edit").forEach((button) => {
      button.addEventListener("click", (e) => {
        cancelUpdateBtn.classList.remove('hidden');
        const postId = e.target.getAttribute("data-id");
        editPost(postId);
      });
    });

    document.querySelectorAll(".delete").forEach((button) => {
      button.addEventListener("click", (e) => {
        const postId = e.target.getAttribute("data-id");
        deletePost(postId);
      });
    });
  });
}

// Function to delete a post
async function deletePost(id) {
  if (confirm("Are you sure you want to delete this post?")) {
    const postRef = ref(db, "posts/" + id);
    remove(postRef)
      .then(() => {
        alert("post deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting post: ", error);
      });
    loadPosts();
  }
}

// Function to edit a post
async function editPost(id) {
  const postRef = ref(db, "posts/" + id);
  onValue(
    postRef,
    (snapshot) => {
      const post = snapshot.val();
      document.getElementById("postId").value = id;
      document.getElementById("wisherName").value = post.name;
      document.getElementById("wisherMessage").value = post.message;
      document.getElementById("isShown").value = post.checked;
    },
    { onlyOnce: true }
  );
}

// Event listener for form submission
document.getElementById("postForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const postId = document.getElementById("postId").value;
  const name = document.getElementById("wisherName").value;
  const message = document.getElementById("wisherMessage").value;
  const isShown = document.getElementById("isShown").checked;
  addOrUpdatePost(postId, name, message, isShown);
  e.target.reset();
  document.getElementById("postId").value = ""; // Clear the hidden input
});

cancelUpdateBtn.addEventListener("click", () => {
  postForm.reset();
  document.getElementById("postId").value = ""; // Clear the hidden input
  cancelUpdateBtn.classList.add("hidden");
});

// Load posts on page load
window.onload = loadPosts;
