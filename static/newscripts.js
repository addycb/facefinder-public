
//Static color codes
const colorCodes = [
  "#DC143C", // Central Node
  "#FF8C00", // Level 1 Nodes
  "#FFD700", // Level 2 Nodes
  "#00FF7F", // Level 3 Nodes
  "#00BFFF", // Level 4 Nodes
  "#7B68EE", // Level 5 Nodes
  "#BA55D3"  // Level 6 Nodes
];

const borderCodes=[
"#EC143C", // Central Node
"#FF9C00", // Level 1 Nodes
"#FFF000", // Level 2 Nodes
"#00FF60", // Level 3 Nodes
"#00A9FF", // Level 4 Nodes
"#7B59EE", // Level 5 Nodes
"#BA3AD3"  // Level 6 Nodes
];

var nodes;

function titlenodes(){
  nodes = new vis.DataSet([
    { id: '1', x: 10, y: -30, color: '#00FF00' },
    { id: '2',  x: -75, y: 20, color: '#00FF00' },
    { id: '3',  x: 95, y: 20, color: '#00FF00' },
    { id: '4',  x: 160, y: 100, color: '#0000FF' },
    { id: '5',  x: -140, y: 100, color: '#FF0000' },
    { id: '6',  x: -100, y: 225, color: '#FF0000' },
    { id: '7',  x: 120, y: 225, color: '#0000FF' },
    { id: '8',  x: -55, y: 325, color: '#FF0000' },
    { id: '9',  x: 75, y: 325, color: '#0000FF' },
  ]);
}
titlenodes()
var edges = new vis.DataSet([]);
var nodeDataMap = {}; // Store node-specific data
/*
nodeDataMap dictionary:
key: node ID
value: object with the following properties:
- level: the level of the node in the hierarchy
- imagedata: the image data for the node
- notes: notes for the node
- images: an array of images for the node
  - imagelink: the link to the image
  - otherpeople: an array of faces of other people in the image
  - contextlinks: the links to the image context
  - exifdata: the EXIF data for the imag
- searchable: whether the node is searchable
- leaf: whether the node is a leaf node

*/
var container=document.getElementById('mynetwork')
var data = { nodes: nodes, edges: edges };
var seenimages=new Set();
var seenlinks=new Set();
var lastnodecreated=0;
//Options
var relative_size=true;
var sizemult=10;

var options={}
if(relative_size){
  options = {
    physics: {
      enabled: true // Disable physics to keep nodes in fixed positions
    },
    nodes: {
      borderWidth: 4,
      color: {
        highlight:{
          border:'#00FF00',
          background:'#D2E5FF'
        }
      },
      scaling: {
        customScalingFunction: function (min,max,total,value) {
          return value/total;
        },
        min:1,
        max:50
      },
      font : {
        size : 16,
        color : '#ffffff'
    },
    }
  };
}

var network = new vis.Network(container, data, options);
var selectedNodeId=null;

var buttonHolder = document.createElement('div');
buttonHolder.className = 'button-holder';

// Add buttons to the container
buttonHolder.innerHTML = `
<button id="focus-button" class="focus-button">Focus Back on Graph</button>
<button id="prune-button" class="prune-button">Prune Node</button>
<div style="display: flex; justify-content: center; gap: 25px;">
    <button id="about-button" style="display: inline-flex; align-items: center; text-decoration: none; background-color: #007bff; color: #fff; padding: 10px 20px; border-radius: 5px; font-size: 16px; font-weight: bold;margin-top: 10px;border: none;cursor: pointer;">
        About
    </button>
    <button id="search-button-main" class="search-button-main" style="display: inline-flex; align-items: center; text-decoration: none; background-color: #007bff; color: #fff; padding: 10px 20px; border-radius: 5px; font-size: 16px; font-weight: bold;">
        New Search
    </button>
    <div class="pulsing-background">
        <button id="download-button" class="btn btn-primary btn-lg download-button" style="display: inline-flex; align-items: center; text-decoration: none;color: #fff; padding: 10px 20px; border-radius: 5px; border: none; cursor:pointer; font-size: 16px; font-weight: bold;">
            <svg class="svg-inline--fa fa-download fa-w-16 d-print-none" aria-hidden="true" data-fa-processed="" data-prefix="fa" data-icon="download" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width: 18px; height: 18px; margin-right: 8px; fill: currentColor; vertical-align: middle;">
                <path fill="currentColor" d="M216 0h80c13.3 0 18 10.7 18 18v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V18c0-13.3 10.7-18 18-18zm296 376v112c0 13.3-10.7 18-18 18H18c-13.3 0-18-10.7-18-18V376c0-13.3 10.7-18 18-18h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 18 10.7 18 18zm-118 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path>
            </svg>
            Download
        </button>
    </div>
</div>

`;
container.appendChild(buttonHolder)


function drawRGBBackground(network) {
  network.on('beforeDrawing', function(ctx) {
      // Set font properties
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Draw the letter 'R' in red
      ctx.bold = true;
      ctx.fillStyle = 'red';
      ctx.fillText('R', -75, 100); // x, y coordinates
      // Draw the letter 'G' in green
      ctx.fillStyle = 'green';
      ctx.fillText('G', 10, 100); // x, y coordinates
      // Draw the letter 'B' in blue
      ctx.fillStyle = 'blue';
      ctx.fillText('B', 100, 100); // x, y coordinates
      ctx.bold=false;
      ctx.fillStyle = 'red';
      ctx.fillText('AT', -50, 200); // x, y coordinates
      ctx.fillStyle = 'green';
      ctx.fillText('TA', 10, 200); // x, y coordinates
      ctx.fillStyle = 'blue';
      ctx.fillText('CK', 70, 200); // x, y coordinates
  });
}
drawRGBBackground(network);
/*
//function to hash base 64 string
function crc32HashBase64(base64String) {
  // Decode base64 to binary string
  const binaryString = atob(getBase64FromFile(base64String));
  // Compute CRC32 hash
  const hash = CRC32.str(binaryString);
  // Convert hash to hexadecimal format
  return (hash >>> 0).toString(16).padStart(8, '0'); // Ensure it's 8 characters long
}
*/
function linkSeen(imglink){
  if(seenlinks.has(imglink)){
    return true;
  }
  else{
    seenlinks.add(imglink);
    return false;
  }
}
/*
// unused function to check if image is seen
function imageSeen(base64String) {
  const hash = crc32HashBase64(base64String);
  // Check if hash is in the set
  if(seenimages.has(hash)){
    return true;
  }
  else{
    seenimages.add(hash);
    return false;
  }
}

//curently unused func filetobase64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
          // The result of the FileReader is a data URL, which starts with 'data:[<mediatype>];base64,'
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
      };

      reader.onerror = () => {
          reject(new Error('Failed to read file as Base64'));
      };

      // Read the file as a Data URL
      reader.readAsDataURL(file);
  });
}
*/


function getBase64FromFile(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
  });
}



function gen_html(nodeid){
    if(nodeDataMap[nodeid].leaf){
        var cardsHtml=`
            <div class="card">
              <div class="card-content">
              <img src="${nodeDataMap[nodeid].imagedata}" alt="Image">
                <h3>Dead end. We found no results.</h3>
              </div>
            </div>
            `
    }
    else{
        var cardsHtml=nodeDataMap[nodeid].images.map((image, index) =>`
            <div class="card">
            <button class="remove-button" onclick="removeImage(${nodeid}, ${index})" style="color: red; background: none; border-radius:5px; border: none; font-size: 20px; cursor: pointer;">&times;</button>
              <img src="${image.imagelink}" alt="Image">
              <div class="card-content">
                <button class="search-button" onclick="window.open('${image.contextlinks}', '_blank')">Search Context Links</button>
                <div class="exif-data">${image.exifdata}</div>
              </div>
            </div>
          `).join('');
    cardsHtml=`
            <div class="card">
              <img src="${nodeDataMap[nodeid].imagedata}" alt="Image">
            </div>
            `+cardsHtml;
  }
    cardsHtml += `
        <div class="card">
          <div class="card-content">
            <h3>Notes:</h3>
             <textarea id="notes-${nodeid}" rows="6" cols="50" placeholder="Enter notes here...">${nodeDataMap[nodeid].notes}</textarea>
          </div>
        </div>
    `;
    return cardsHtml
}

document.addEventListener('input', function(event) {
  if (event.target.matches('textarea[id^="notes-"]')) {
      const nodeId = event.target.id.split('-')[1];
      const notes = event.target.value;
      if (nodeDataMap[nodeId]) {
          nodeDataMap[nodeId].notes = notes;
          // Optionally, you can save this data to the server here
      }
  }
});
    
function base64ToBlob(base64, contentType = '') {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

function createImageUploadForm(storage_location,node_id){
        imgdata=nodeDataMap[node_id].imagedata
        //create a div with the class card
        var card = document.createElement('div');
        // Create form element
        var form = document.createElement('form');
        form.setAttribute('action', window.location.origin +'/upload');
        form.setAttribute('method', 'post');
        form.setAttribute('enctype', 'multipart/form-data');

        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.alignItems = 'center';
        form.style.justifyContent = 'center';

        // Create file input
        if(!imgdata&&nodeDataMap[node_id].images==null){
             var label = document.createElement('label');
             var title=document.createElement('h2');
             title.textContent = 'Initial Search';
             //label.setAttribute('for', 'image');
              //label.textContent = 'Initial Search';
             //form.appendChild(label);
            form.appendChild(title);
             var input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('id', 'image');
            input.setAttribute('name', 'image');
            input.setAttribute('accept', 'image/*');
            input.required = true;
            //Replace form with input
            form.appendChild(input);
        }
        else if(imgdata){
          // Display image if it exists
          var imageElement = document.createElement('img');
          imageElement.setAttribute('src', imgdata);
          imageElement.setAttribute('alt', 'Image');
          imageElement.style.maxWidth = '100px'; // Adjust size as needed
          imageElement.style.maxHeight = '100px'; // Adjust size as needed
          form.appendChild(imageElement); 
          var label = document.createElement('label');
             label.setAttribute('for', 'image');
            label.textContent = 'Search for Person';
             form.appendChild(label);
            var hiddenInput = document.createElement('input');
            hiddenInput.setAttribute('type', 'hidden');
            hiddenInput.setAttribute('name', 'base64image');
            hiddenInput.setAttribute('value', imgdata);
            form.appendChild(hiddenInput);
        }
        // Create img element to show thumbnail
       // var thumbnail = document.createElement('img');
        //thumbnail.setAttribute('src', img);
        //thumbnail.setAttribute('alt', 'Image Thumbnail');
        //thumbnail.style.width = '100px'; // Set thumbnail size
        //thumbnail.style.height = '100px';
        //form.appendChild(thumbnail);
        
        // Create submit button
        var button = document.createElement('button');
        button.setAttribute('type', 'submit');
        button.textContent = 'Upload';
        //make the button referencable later by id
        button.setAttribute('id', 'text-upload-button');
        form.appendChild(button);
        // Append form to the body or a specific container
       // storage_location.innerHTML=form.outerHTML;
       storage_location.innerHTML=''; // Clear the container  
       card.appendChild(form);
       storage_location.appendChild(card);
       //storage_location.appendChild(form);
        
        // Add event listener to handle form submission
        form.addEventListener('submit', async function(event) {
          event.preventDefault();
            var formData = new FormData();
            
            if (imgdata instanceof File) {
              // If img is a file object
              formData.append('image', imgdata);
            } 
            else if (typeof imgdata === 'string') {
              //console.log("imgdata string")
              //console.log(imgdata)
              // If img is a base64 string
              const blob = base64ToBlob(imgdata, 'image/png');
              formData.append('image', blob, 'image.png');
            } 
            else {
              // Handle file input if img is null
              var fileInput = form.querySelector('input[type="file"]');
              
              if (fileInput && fileInput.files.length > 0) {
                  formData.append('image', fileInput.files[0]);
              }
          }
          form.classList.add('loading');
          //Make the search button display loading
          document.getElementById('text-upload-button').textContent = 'Loading. Please be patient, this may take a while...';
            try {
                var response = await fetch(window.location.origin +'/upload', {
                  method: 'POST',
                  body: formData,
            });
            var result = await response.json();
            if(result.error){
              alert(result.error)
              return
            }
            var images=result.images.map(image=>({
              imagelink:image.imagelink,
              contextlinks:image.contextlinks,
              exifdata:image.exifdata,
              otherpeople:image.otherpeople,
              imgchildren:[]
            }));
          images=images.filter(image=>!linkSeen(image.imagelink))
          //create children
          i=-1
          for(const resimg of images){
            i+=1
              for(const peopleimg of resimg.otherpeople){
                  //make a node for child
                  createnode(node_id,peopleimg)
                  //add info to nodedatamap about new node's parent image
                  resimg.imgchildren.push(lastnodecreated)
              }
          }
          if(images.length>0){
            //console.log("Matches found.")
            //console.log("change node size")
            nodeDataMap[node_id].images=images
            nodeDataMap[node_id].leaf=false
            nodes.update({id:node_id, value:images.length,font:{size:16+images.length},shadow:{enabled:false}})
          }
          else{ 
            //console.log("No matches found.")
            nodeDataMap[node_id].leaf=true
            nodes.update({id:node_id, shadow:{enabled:true,color:'#FF0000'}})
          }
          images=images.map(image=>({
              imagelink:image.imagelink,
              contextlinks:image.contextlinks,  
              exifdata:image.exifdata
          }));
          nodeDataMap[node_id].searchable=false
          nodeDataMap[node_id].imagedata = await getBase64FromFile(formData.get('image'));
            var nodeCards = document.getElementById('node-cards');
            //console.log("updating node cards")
            //console.log(node_id)
            nodeCards.innerHTML=gen_html(node_id)
            }
            catch (error) {
                console.error('Error uploading image:', error);
                alert('There was an error uploading the image.');
                var btntxt=document.getElementById('text-upload-button').textContent = "Loading. Please be patient, this may take a while. Don't close the page";
                if(btntxt){
                  document.getElementById('text-upload-button').textContent = 'Upload';
                }
              }
            finally{
              form.classList.remove('loading');
            }
        });

}
function removeImage(nodeId, imageIndex) {
  if (nodeDataMap[nodeId] && nodeDataMap[nodeId].images) {
      // Remove all children of image
      for (const childnode of nodeDataMap[nodeId].images[imageIndex].imgchildren){
        pruneNode(childnode)
      }
      // Remove the image from the node
      nodeDataMap[nodeId].images.splice(imageIndex, 1);
      // Update the displayed HTML
      var nodeCards = document.getElementById('node-cards');
      nodeCards.innerHTML = gen_html(nodeId);
  }
}

function createnode(parentnode,imagedata){
    thisnodeid=lastnodecreated+1
    lastnodecreated=thisnodeid
    //console.log(thisnodeid)
    if(imagedata){
      //console.log("got new node with image")
      //console.log(nodeDataMap)
      nodeDataMap[thisnodeid]={
        level:(nodeDataMap[parentnode]).level+1,
        imagedata:imagedata,
        searchable:true,
        notes:''
      }
        nodes.add({id:thisnodeid,label:'Person',color:{border:borderCodes[((nodeDataMap[parentnode]).level+1)%7],background:colorCodes[((nodeDataMap[parentnode]).level+1)%7]},value:sizemult*1,shadow:{enabled:true,color:'#0000FF'}})
        //console.log(nodes.get(thisnodeid).value)
        //console.log("last value: new node value:")
        //Recursive search
        //color mode
        edges.add({from:parentnode,to:thisnodeid,color:{inherit:'both'}})
        //console.log("added edge")
        //console.log(parentnode)
        //console.log(nodeDataMap[parentnode])
    }
    else if(parentnode!=0){
        throw new Error("No image but not root? It's giving nothing.");
    }
    else{ 
        //New root
        nodeDataMap[thisnodeid]={
            level:0,
            imagedata:null,
            searchable:true,
            notes:'',
            leaf:true
        }
        nodes.add({id:thisnodeid,label:'Target Person',color:{border:borderCodes[0],background:colorCodes[0]},value:sizemult*1})     
    }
    }


//focus nodes
network.on('click', function (properties) {
    if (properties.nodes.length > 0) {
      document.getElementById('search-button-main').style.display = 'none'; // Hide the search button
      var nodeId = properties.nodes[0];
      selectedNodeId = nodeId;
      
      var cardContainer = document.getElementById('card-container');
      var nodeLabelInput = document.getElementById('node-label');
      var nodeCards = document.getElementById('node-cards');
      

      
      if (nodeDataMap[nodeId]) {
        nodeLabelInput.value = nodeDataMap[nodeId].label || '';
        nodeLabelInput.placeholder = "Enter a name or identifier...";
        if(nodeDataMap[nodeId].searchable){
          //console.log(nodeDataMap[nodeId].leaf)
        //show populated cards
        createImageUploadForm(nodeCards,nodeId)

      } else {
        nodeCards.innerHTML=gen_html(nodeId)
      }
    }
      else{
        // Node data does not exist, throw error
        throw new Error("WHERE DID YOU GET THIS NODE???");
      }
      document.getElementById('focus-button').style.display = 'block'; // Show the button
      document.getElementById('prune-button').style.display = 'block'; // Show the button

      cardContainer.style.display = 'block';
    }
    });

//refocus graph
document.getElementById('focus-button').addEventListener('click', function () {
    var cardContainer = document.getElementById('card-container');
    cardContainer.style.display = 'none';
    this.style.display = 'none'; // Hide the button
    document.getElementById('prune-button').style.display = 'none'; // Hide the button

    
    document.getElementById('search-button-main').style.display = 'block'; // Show the search button
    
    if (selectedNodeId !== null) {
      network.focus(selectedNodeId, { scale: 1.5 }); // Refocus on the previously selected node
    }
  });

//function to simulate node click on nodeId
  function simclick (nodeId) {
      document.getElementById('search-button-main').style.display = 'none'; // Hide the search button
      selectedNodeId = nodeId;
      var cardContainer = document.getElementById('card-container');
      var nodeLabelInput = document.getElementById('node-label');
      var nodeCards = document.getElementById('node-cards');
      if (nodeDataMap[nodeId]) {
        nodeLabelInput.value = nodeDataMap[nodeId].label || '';
        nodeLabelInput.placeholder = "Enter a name or identifier...";
        if(nodeDataMap[nodeId].searchable){
          //console.log(nodeDataMap[nodeId].leaf)
        //show populated cards
        createImageUploadForm(nodeCards,nodeId)
      } else {
        nodeCards.innerHTML=gen_html(nodeId)
      }
    }
      else{
        // Node data does not exist, throw error
        throw new Error("WHERE DID YOU GET THIS NODE???");
      }
      document.getElementById('focus-button').style.display = 'block'; // Show the button
      document.getElementById('prune-button').style.display = 'block'; // Show the button

      cardContainer.style.display = 'block';
    }

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Select the search button
    const searchButton = document.getElementById('search-button-main');
  
    // Add a click event listener
    searchButton.addEventListener('click', function(){ 
      nodes.clear()
      edges.clear()
      nodeDataMap={}
      seenlinks.clear()
      seenimages.clear()
      lastnodecreated=0
      createnode(0,null)
      simclick(1)
    });
    });

document.getElementById('node-label').addEventListener('change', function () {
    if (selectedNodeId !== null) {
        nodes.update({ id: selectedNodeId, label: this.value });
        // Update the label in the stored data
        if (nodeDataMap[selectedNodeId]) {
        nodeDataMap[selectedNodeId].label = this.value;
        }
    }
    });
  


//Prune Node Button
document.getElementById('prune-button').addEventListener('click', function() {
  if (selectedNodeId !== null) {
      pruneNode(selectedNodeId);
  } else {
      alert('No node selected for pruning');
  }
  this.style.display = 'none'; // Hide the prune button
  var cardContainer = document.getElementById('card-container');
  cardContainer.style.display = 'none'; // Hide the card container
  document.getElementById('focus-button').style.display = 'none'; // Hide the focus button
  document.getElementById('search-button-main').style.display = 'block'; // Show the search button
});

//Prune Node Function
function pruneNode(nodeId) {
  // Remove the node from nodeDataMap
  delete nodeDataMap[nodeId];
  
  // remove the node from the network visualization
  nodes.remove({ id: nodeId });
  
  // Update the HTML display 
  var nodeCards = document.getElementById('node-cards');
  nodeCards.innerHTML = ''; // Or update with new content
  
  // Reset selected nodeId
  selectedNodeId = null;
}


document.getElementById('download-button').addEventListener('click', async function () {
  data={
  nodeDataMap: JSON.stringify(nodeDataMap),
  edges: JSON.stringify(edges.get())
  }
  //Log to console all node leaf status
  try {
      const response = await fetch(window.location.origin +'/export', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
      });

      if (!response.ok) {
          throw new Error('Failed to Export XLSX.');
      }

      // Assuming the server returns a .xlsx file, handle the download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mysearch.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
  } catch (error) {
      console.error('Error exporting XLSX:', error);
      alert('An error occurred while exporting the XLSX.');
  }
});

window.addEventListener('click', function(event) {
  if (event.target == aboutModal) {
      aboutModal.style.display = 'none';
  }
});


const aboutButton = document.getElementById('about-button');
const aboutModal = document.getElementById('about-modal');
const okButton = document.getElementById('ok-button');

// Show the modal when the About button is clicked
aboutButton.addEventListener('click', function() {
    aboutModal.style.display = 'flex';
    //hide other buttons
    document.getElementById('search-button-main').style.display = 'none'; 
    document.getElementById('download-button').style.display = 'none'; 
    aboutButton.style.display = 'none'; 
    aboutModal.querySelector('.modal-content').scrollTop = 0; // Scroll to the top of the modal
    

});

// Hide the modal when the OK button is clicked
okButton.addEventListener('click', function() {
    aboutModal.style.display = 'none';
    //show other buttons
    document.getElementById('search-button-main').style.display = 'block'; // Show the search button
    document.getElementById('download-button').style.display = 'block'; // Show the download button
    aboutButton.style.display = 'block'; // Show the about button
});

// Optional: Hide the modal if the user clicks outside of it
window.addEventListener('click', function(event) {
    if (event.target == aboutModal) {
        aboutModal.style.display = 'none';
        document.getElementById('search-button-main').style.display = 'block'; // Show the search button
        document.getElementById('download-button').style.display = 'block'; // Show the download button
        aboutButton.style.display = 'block'; // Show the about button
    }
});
document.getElementById('physics-toggle').addEventListener('change', function() {
  var isChecked = this.checked;
  network.setOptions({
      physics: {
          enabled: isChecked
      }
  });
});