const form_csv = document.getElementById("form-csv");
const url = "http://localhost:3000"


form_csv.addEventListener("submit", async e => {
    e.preventDefault();

    let dataForm = new FormData(form_csv);

    try {
        const res = await fetch(`${url}/send_clients`, {
            method: "POST",
            body: dataForm
        });
        const data = await res.json();


        alert(JSON.stringify(data.message)) 
        form_csv.reset()
    } catch (er) {
        console.log(er);
        alert("Error")
        
    }

})