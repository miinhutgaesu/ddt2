// Firebase 초기화
var firebaseConfig = {
    apiKey: "AIzaSy8kJhzWdl-Z_4_Q39DvYgU_t94SOSJ3KLo",
    authDomain: "dddt-8bbec.firebaseapp.com",
    databaseURL: "https://dddt-8bbec-default-rtdb.firebaseio.com",
    projectId: "dddt-8bbec",
    storageBucket: "dddt-8bbec.appspot.com",
    messagingSenderId: "251287088381",
    appId: "1:251287088381:web:3e7aeccf93a6a7ce9aa294"
  };
  firebase.initializeApp(firebaseConfig);
  
  // 데이터베이스 참조
  const db = firebase.database();
  
  document.addEventListener("DOMContentLoaded", () => {
      let currentUser = "";
  
      const setUsernameButton = document.getElementById("setUsername");
      const timezoneSelect = document.getElementById("timezone");
      const dateInput = document.getElementById("dateInput");
      const resetButton = document.getElementById("resetSelections");
      const timeTableDiv = document.getElementById("timeTable");
  
      setUsernameButton.addEventListener("click", () => {
          currentUser = document.getElementById("username").value.trim();
          if (currentUser) {
              alert(`Username set to: ${currentUser}`);
          } else {
              alert("Please enter a valid username.");
          }
      });
  
      const generateTimeTable = () => {
          const selectedDate = dateInput.value;
          const selectedTimezone = timezoneSelect.value;
  
          if (!selectedDate || !currentUser) return;
  
          timeTableDiv.innerHTML = "";
  
          for (let hour = 0; hour < 24; hour++) {
              const timeSlot = document.createElement("div");
              timeSlot.classList.add("time-slot");
  
              // 시간대를 변환
              const localTime = new Date(`${selectedDate}T${hour.toString().padStart(2, '0')}:00:00`);
              const formatter = new Intl.DateTimeFormat("en-US", {
                  timeZone: selectedTimezone,
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false
              });
              const formattedTime = formatter.format(localTime);
  
              timeSlot.textContent = formattedTime;
  
              // Firebase에서 데이터 가져오기
              const timeRef = db.ref(`schedules/${selectedDate}/${hour}`);
              timeRef.on("value", (snapshot) => {
                  const users = snapshot.val();
                  if (users) {
                      timeSlot.classList.add("selected");
                      timeSlot.textContent = `${formattedTime} (Selected by ${Object.keys(users).join(", ")})`;
                  } else {
                      timeSlot.classList.remove("selected");
                      timeSlot.textContent = formattedTime;
                  }
              });
  
              timeSlot.addEventListener("click", () => {
                  if (!currentUser) {
                      alert("Please set a username first.");
                      return;
                  }
  
                  const userRef = db.ref(`schedules/${selectedDate}/${hour}`);
                  
                  // 시간대가 이미 선택된 경우, 선택 취소
                  userRef.once("value", (snapshot) => {
                      if (snapshot.exists()) {
                          if (snapshot.hasChild(currentUser)) {
                              userRef.child(currentUser).remove();
                          } else {
                              userRef.child(currentUser).set(true);
                          }
                      } else {
                          userRef.child(currentUser).set(true);
                      }
                  });
              });
  
              timeTableDiv.appendChild(timeSlot);
          }
      };
  
      dateInput.addEventListener("change", generateTimeTable);
      timezoneSelect.addEventListener("change", generateTimeTable);
  
      resetButton.addEventListener("click", () => {
          const selectedDate = dateInput.value;
          if (!selectedDate) return;
  
          if (confirm("Are you sure you want to reset all selections for this date?")) {
              db.ref(`schedules/${selectedDate}`).remove();
          }
      });
  });
  