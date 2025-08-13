import Swal from 'sweetalert2';

const addClient = document.getElementById("addClient");
const table = document.getElementById("tableClients")
const url = "http://localhost:3000"

fetch(url + "/getClients")
    .then(res => res.json())
    .then(data => {
      for (let i of data) {
        table.innerHTML += `  
                <tr class="border-2" id="${i.id}">
                    <td class="p-2">${i.id}</td>
                    <td class="p-2">${i.name}</td>
                    <td class="p-2">${i.identification}</td>
                    <td class="p-2">${i.address}</td>
                    <td class="p-2">${i.phone}</td>
                    <td class="p-2">${i.email}</td>
                    <td class="p-2"><button class="text-blue-400 cursor-pointer hover:scale-102 transition-transform">Update</button></td>
                    <td class="p-2"><button class="text-red-500 cursor-pointer hover:scale-102 transition-transform">Delete</button></td>
                </tr>
            `;
      }
});


//Add client
addClient.addEventListener("click", (e) => {
    Swal.fire({
      title: 'Insert new client',
      html: `
        <form id="form">
          <div>
              <label for="name">Name</label>
              <input type="text" id="name" name="name" class="border-1 rounded-xl m-1 p-2"  placeholder="Name">
          </div>
          <div>
              <label for="identification">Identification</label>
              <input type="text" id="identification" name="identification" class="border-1 rounded-xl m-1 p-2" placeholder="Identification">
          </div>
          <div>
              <label for="address">Address</label>
              <input type="text" id="address" name="address" class="border-1 rounded-xl m-1 p-2" placeholder="Address">
          </div>
          <div>
              <label for="phone">Phone</label>
              <input type="text" id="phone" name="phone" class="border-1 rounded-xl m-1 p-2" placeholder="Phone">
          </div>
          <div
              <label for="email">Email</label>
              <input id="email" type="text" name="email" class="border-1 rounded-xl m-1 p-2" placeholder="Email">       
          </div>
        </form>
        `,
      confirmButtonText: "Send",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      preConfirm: async () => {
        const form = document.getElementById('form');
        let dataForm = new FormData(form);
  
        dataForm = Object.fromEntries(dataForm.entries());

        try {
          fetch(url + '/postClient', {
            method: 'POST',
            headers: {
              'Content-Type': "application/json"
            },
            body: JSON.stringify(dataForm)
          });

          alert("Client created")

        } catch (err) {
          console.error(err)
        }
      }
    })
  });

   //Capture the event
  table.addEventListener("click", async (e) => {

    //Acces to the text of the target
    if (e.target.textContent == "Update") {

      let data = await e.target.parentNode.parentNode.children;
      data = await Array.from(data).map(i => i.textContent);

        
      Swal.fire({
        title: 'Update client',
        html: `
        <form id="form">
          <div>
              <label for="name">Name</label>
              <input type="text" id="name" name="name" class="border-1 rounded-xl m-1 p-2"  placeholder="Name" value="${data[1]}">
          </div>
          <div>
              <label for="identification">Identification</label>
              <input type="text" id="identification" name="identification" class="border-1 rounded-xl m-1 p-2" placeholder="Identification" value="${data[2]}">
          </div>
          <div>
              <label for="address">Address</label>
              <input type="text" id="address" name="address" class="border-1 rounded-xl m-1 p-2" placeholder="Address" value="${data[3]}">
          </div>
          <div>
              <label for="phone">Phone</label>
              <input type="text" id="phone" name="phone" class="border-1 rounded-xl m-1 p-2" placeholder="Phone" value="${data[4]}">
          </div>
          <div
              <label for="email">Email</label>
              <input id="email" type="text" name="email" class="border-1 rounded-xl m-1 p-2" placeholder="Email" value="${data[5]}">       
          </div>
        </form>
        `,
        confirmButtonText: "Update",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        preConfirm: async () => {
          const form = document.getElementById('form');
          let dataForm = new FormData(form);

          dataForm = Object.fromEntries(dataForm.entries());
          dataForm["id"] = data[0];
          
          try {
            let res = await fetch(url + "/updateClient", {
              method: "PUT",
              headers: {
                'Content-Type': "application/json"
              },
              body: JSON.stringify(dataForm)
            })
            
            res = await res.json();
            alert(res.message)

          } catch (er) {
            console.error(er);
            alert("An error and ocurrered");
          }
        }
      })    

    } else if (e.target.textContent == "Delete") {
      let id = e.target.parentNode.parentNode.id;

      Swal.fire({
        title: "Are you sure to delete?",
        icon: "warning",
        confirmButtonText: "Delete",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        preConfirm: async () => {
            try {
                let res = await fetch(url + "/deleteClient", {
                  method: "DELETE",
                  headers: {
                    'Content-Type': "application/json"
                  },
                  body: JSON.stringify({ "id": id })
                });
                res = await res.json();

                alert(res.message)

            } catch (er) {
                console.error(er);
                alert("Error")
            }
        }
      })
    }
  });