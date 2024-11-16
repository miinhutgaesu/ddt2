const timeSlots = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
const userId = "user-1"; // 사용자 ID를 설정합니다. 각 사용자가 고유한 ID를 가지도록 해야 합니다.

// 스케줄 테이블 생성
function generateTimeTable() {
    const date = document.getElementById("dateInput").value;
    const timezoneOffset = parseInt(document.getElementById("timezoneSelect").value, 10);

    if (!date) {
        alert("Please select a date.");
        return;
    }

    const tableBody = document.getElementById("time-table");
    tableBody.innerHTML = "";

    timeSlots.forEach((time) => {
        const row = document.createElement("tr");
        const timeCell = document.createElement("td");
        const actionCell = document.createElement("td");

        const [hour, minutes] = time.split(':');
        const adjustedHour = (parseInt(hour) + timezoneOffset + 24) % 24;
        const adjustedTime = `${String(adjustedHour).padStart(2, '0')}:${minutes}`;

        timeCell.textContent = adjustedTime;
        actionCell.classList.add("action-cell");
        actionCell.dataset.time = time;

        actionCell.addEventListener("click", () => {
            const path = `schedules/${date}/${time}`;
            db.ref(path).transaction((currentValue) => {
                if (currentValue && currentValue[userId]) {
                    delete currentValue[userId];
                    if (Object.keys(currentValue).length === 0) {
                        currentValue = null;
                    }
                } else {
                    if (!currentValue) {
                        currentValue = {};
                    }
                    currentValue[userId] = true;
                }
                return currentValue;
            }).then(() => {
                console.log("Data updated successfully");
            }).catch((error) => {
                console.error("Data update failed:", error);
            });
        });

        row.appendChild(timeCell);
        row.appendChild(actionCell);
        tableBody.appendChild(row);

        const path = `schedules/${date}/${time}`;
        db.ref(path).on("value", (snapshot) => {
            const users = snapshot.val();
            if (users) {
                actionCell.className = "action-cell selected";
                actionCell.textContent = `Selected (${Object.keys(users).length})`;
            } else {
                actionCell.className = "action-cell";
                actionCell.textContent = "";
            }
        });
    });
}

// 날짜와 시간대 변경 시 스케줄 테이블 재생성
document.getElementById("dateInput").addEventListener("change", generateTimeTable);
document.getElementById("timezoneSelect").addEventListener("change", generateTimeTable);

// 페이지 로드 시 기존 데이터 가져오기
document.addEventListener("DOMContentLoaded", () => {
    const date = document.getElementById("dateInput").value;
    if (date) {
        generateTimeTable();
    }
});