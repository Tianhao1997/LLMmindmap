// For more details on how to use OpenAI's API, see https://platform.openai.com/account/api-keys
const apiKey = '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';
const data_example = JSON.stringify({
  "nodes": [
    {"id": "Node1", "x": 50, "y": 50, "size": [60, 60], "shape": "circle", "style": {"fill": "red", "stroke": "darkred", "lineWidth": 2}, "label": "Apple"},
    {"id": "Node2", "x": 200, "y": 50, "size": [60, 60], "shape": "circle", "style": {"fill": "orange", "stroke": "darkorange", "lineWidth": 2}, "label": "iOS"},
    {"id": "Node3", "x": 350, "y": 50, "size": [60, 60], "shape": "circle", "style": {"fill": "yellow", "stroke": "gold", "lineWidth": 2}, "label": "App Store"},
    {"id": "Node4", "x": 500, "y": 50, "size": [60, 60], "shape": "circle", "style": {"fill": "green", "stroke": "darkgreen", "lineWidth": 2}, "label": "Face ID"},
    {"id": "Node5", "x": 650, "y": 50, "size": [60, 60], "shape": "circle", "style": {"fill": "blue", "stroke": "navy", "lineWidth": 2}, "label": "Siri"},
    {"id": "Node6", "x": 50, "y": 250, "size": [60, 60], "shape": "circle", "style": {"fill": "purple", "stroke": "indigo", "lineWidth": 2}, "label": "iCloud"},
    {"id": "Node7", "x": 200, "y": 250, "size": [60, 60], "shape": "circle", "style": {"fill": "pink", "stroke": "deeppink", "lineWidth": 2}, "label": "A-Series Chip"},
    {"id": "Node8", "x": 350, "y": 250, "size": [60, 60], "shape": "circle", "style": {"fill": "cyan", "stroke": "darkcyan", "lineWidth": 2}, "label": "Retina Display"},
    {"id": "Node9", "x": 500, "y": 250, "size": [60, 60], "shape": "circle", "style": {"fill": "brown", "stroke": "maroon", "lineWidth": 2}, "label": "Touch ID"},
    {"id": "Node10", "x": 650, "y": 250, "size": [60, 60], "shape": "circle", "style": {"fill": "grey", "stroke": "darkslategray", "lineWidth": 2}, "label": "Lightning Connector"}
  ],
  "edges": [
    {"source": "Node1", "target": "Node2", "style": {"stroke": "darkorange", "lineWidth": 4}, "label": "operates"},
    {"source": "Node1", "target": "Node3", "style": {"stroke": "gold", "lineWidth": 3}, "label": "hosts"},
    {"source": "Node2", "target": "Node4", "style": {"stroke": "darkgreen", "lineWidth": 5}, "label": "supports"},
    {"source": "Node2", "target": "Node5", "style": {"stroke": "navy", "lineWidth": 3}, "label": "integrates"},
    {"source": "Node1", "target": "Node6", "style": {"stroke": "indigo", "lineWidth": 2}, "label": "provides"},
    {"source": "Node1", "target": "Node7", "style": {"stroke": "deeppink", "lineWidth": 4}, "label": "contains"},
    {"source": "Node1", "target": "Node8", "style": {"stroke": "darkcyan", "lineWidth": 3}, "label": "features"},
    {"source": "Node2", "target": "Node9", "style": {"stroke": "maroon", "lineWidth": 3}, "label": "supported by"},
    {"source": "Node1", "target": "Node10", "style": {"stroke": "darkslategray", "lineWidth": 2}, "label": "utilizes"}
  ]
}
);

// Initialize an empty array to hold the conversation history 
/*
  {
    "role": "system",
    "content": 
    `Only Output a JSON only depend on the keywords and the number of them that the user says. The labels from nodes are keywords and labels from edges are relationships. Include unique ID (starting with N1, N2, ...), position, size, shape for nodes; ID (starting with E1, E2, ...), source, target for edges; and styles for both, with edge length, color and width reflecting semantic relevance. This is an example: $data_example. `
  }
*/
let conversationHistory = [{
  "role": "system",
  "content": 
  `Only output a JSON depend on the scenario. The JSON contains 20 number of nodes whoes "label" are related keywords from the topic and the "label" of edges are relationships. Include unique ID, position, size, shape for nodes; source, target for edges; and styles for both, with edge length, color and width reflecting semantic relevance. Do not put the same IDs for edges. Use different node and edge color and edge length to represent relationships. Avoid overlapping. This is a template: $data_example. `
}];

document.getElementById('submit-query-btn').addEventListener('click', function() {
  const userQuery = document.getElementById('llm-query').value; // Get the user's query from the input field

  // Append the user's query to the conversation history
  conversationHistory.push({
    "role": "user",
    "content": userQuery
  });

  // Prepare requestData with the entire conversation history
  const requestData = JSON.stringify({
    "model": "gpt-4-turbo-preview",
    "messages": conversationHistory, // Use the updated conversation history here
    "max_tokens": 1024,
    "temperature": 0.7
  });

  async function sendPostRequest() {
    let config = {
      method: 'post',
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` 
      },
      data: requestData,
      maxBodyLength: Infinity
    };

    try {
      const response = await axios(config);
      const chatbotResponse = response.data.choices[0].message.content; // Adjusted to match the expected response structure
      
      // Append the model's response to the conversation history
      conversationHistory.push({
        "role": "system", // or "assistant" based on what you prefer
        "content": chatbotResponse
      });
      console.log(chatbotResponse);
      data = JSON.parse(chatbotResponse.replace(/^\`\`\`json\n|\`\`\`$/g, ''));
      graph.data(data);
      graph.render();
    } catch (error) {
      console.error(error);
    }
  }

  sendPostRequest(); // Call the function to make the request with the updated query and history
});






let autoAddNodeconversation = [{
  "role": "system",
  "content": 
  `You are an assitant who only generate one subset keyword depending on users' input. `
}];
async function autoAddRelatedNode(keyword) {
  // Gather context from other nodes
  let context = "The graph contains the following keywords: ";
  data.nodes.forEach(node => {
    if (node.label !== keyword) { // Exclude the current keyword from the context
      context += `${node.label}, `;
    }
  });

  // Modify the prompt to include the context
  const prompt = `Given the keyword "${keyword}" and considering the context that ${context}, generate a list of related keywords or concepts.`;
  console.log(prompt);

   // Append the user's query to the conversation history
   autoAddNodeconversation.push({
    "role": "user",
    "content": prompt
  });

  // Prepare requestData with the entire conversation history
  const requestData = JSON.stringify({
    // "model": "gpt-3.5-turbo-0125",
    "model": "gpt-4-0125-preview",
    "messages": autoAddNodeconversation, 
    "max_tokens": 1024,
    "temperature": 0.7
  });

  let config = {
    method: 'post',
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}` 
    },
    data: requestData,
    maxBodyLength: Infinity
  };

  const response = await axios(config);
  const chatbotResponse = response.data.choices[0].message.content; // Adjusted to match the expected response structure
  
  // Append the model's response to the conversation history
  conversationHistory.push({
    "role": "system", // or "assistant" based on what you prefer
    "content": chatbotResponse
  });
  console.log(chatbotResponse);

  let newNode = {
    id: `ManualAddNode-${addedNodeCount}`,
    label: chatbotResponse,
    x: manualAddNodePosition.x,
    y: manualAddNodePosition.y,
  };

  if (headerText === 'NODE ContextMenu') { 
    newNode = {
      id: `ManualAddNode-${addedNodeCount}`,
      label: chatbotResponse,
      x: currentElement.item._cfg.model.x + 70,
      y: currentElement.item._cfg.model.y,
    };
    let clickedNodeId = currentElement.item._cfg.id;
    let newManualNodeId = `ManualAddNode-${addedNodeCount}`;
    const newEdge = {
      source: clickedNodeId,
      target: newManualNodeId, 
    };
    data.edges.push(newEdge);
  }
  data.nodes.push(newNode);
  graph.data(data);
  graph.render();
  if (draged) {
    applyCanvasState();
  }
  addedNodeCount = addedNodeCount + 1;
}





let addedNodeCount = 0;
let currentElement = {}; 
let headerText = '';

let data = {nodes: [], edges: [] };
let rightClickPosition = { x: 0, y: 0 };
let manualAddNodePosition = { x: 0, y: 0 };





const contextMenu = new G6.Menu({
  getContent(evt) {
    let header;
    let content = '';
    manualAddNodePosition = graph.getPointByClient(evt.clientX, evt.clientY);

    if (evt.target && evt.target.isCanvas && evt.target.isCanvas()) {
      header = 'Canvas ContextMenu';
      headerText = 'Canvas ContextMenu';
    } else if (evt.item) {
      // console.log(evt.item._cfg.id);
      currentElement = evt;
      const itemType = evt.item.getType();
      header = `${itemType.toUpperCase()} ContextMenu`;
      headerText = `${itemType.toUpperCase()} ContextMenu`;
    }

    if (header === 'NODE ContextMenu') {
    content = `
    <h3>Node Context Menu</h3>
    <button class="manualAddNodeButton context-menu-button" onclick="
      addNodeManual(this);
    ">Manual Add</button><br>

    <button class="context-menu-button" onclick="
      autoAddRelatedNode(currentElement.item.getModel().label);
    ">Auto Add</button><br>

    <button onclick='
      deleteNode();
    ' class="context-menu-button">Delete</button><br>

    <label for="color-picker">Node Color:</label>
    <input id="color-picker" onchange="
      updateNodeColor(this.value);
    "type="color"><br>

    <label for="line-width-changer">Line Width:</label>
    <input id="line-width-changer" type="range" onchange="
      updateNodeWidth(this.value);">`;
  } else if (header === 'EDGE ContextMenu') {
    content = `
    <h3>Line Context Menu</h3>
    <label for="color-picker">Line Color:</label>
    <input id="color-picker" onchange="
      updateEdgeColor(this.value);
    "type="color"><br>

    <label for="line-width-changer">Line Width:</label>
    <input id="line-width-changer" type="range" onchange="
      updateEdgeWidth(this.value);">`;
  } else {
    content = `
    <h3>Canvas Context Menu</h3>
    <button class="manualAddNodeButton context-menu-button" onclick="
      addNodeManual(this);
    ">Manual Add</button><br>

    <button class="context-menu-button" onclick="
      console.log('Auto Add clicked');
    ">Auto Add</button><br>

    <button onclick='
      deleteNode();
    ' class="context-menu-button">Delete</button><br>

    <label for="color-picker">Node Color:</label>
    <input id="color-picker" onchange="
      updateNodeColor(this.value);
    "type="color"><br>

    <label for="line-width-changer">Line Width:</label>
    <input id="line-width-changer" type="range" onchange="
      updateNodeWidth(this.value);">`;
  } 
  return content},

  handleMenuClick: (target, item) => {
    // console.log(target, item);
  },
  // offsetX and offsetY include the padding of the parent container
  offsetX: 16 + 10,
  offsetY: 0,
  // the types of items that allow the menu show up
  itemTypes: ['node', 'edge', 'canvas'],
});





G6.registerBehavior('click-add-edge', {
getEvents() {
  return {
    'node:click': 'onClick',
    mousemove: 'onMousemove',
    'edge:click': 'onEdgeClick' 
  };
},
onClick(ev) {
  const node = ev.item;
  const graph = this.graph;
  const point = {
    x: ev.x,
    y: ev.y
  };
  const model = node.getModel();
  if (this.addingEdge && this.edge) {
    graph.updateItem(this.edge, {
      target: model.id
    });
    graph.setItemState(this.edge, 'selected', true);
    this.edge = null;
    this.addingEdge = false;
  } else {
    const newEdge = {
      source: model.id,
      target: point
    };

    this.edge = graph.addItem('edge', newEdge);
    this.addingEdge = true;
    data.edges.push(newEdge);
  }
},
onMousemove(ev) {
  const point = {
    x: ev.x,
    y: ev.y
  };
  if (this.addingEdge && this.edge) {
    this.graph.updateItem(this.edge, {
      target: point
    });
  }
},
onEdgeClick(ev) {
  const currentEdge = ev.item;
  if (this.addingEdge && this.edge == currentEdge) {
    graph.removeItem(this.edge);
    this.edge = null;
    this.addingEdge = false;
  }
}
});

// Register a custom behavior to add node
G6.registerBehavior('click-add-node', {
getEvents() {
  return {
    'canvas:click': 'onClick'
  };
},
onClick(ev) {
  const graph = this.graph;
  // Convert the click position to the model position
  const modelPosition = graph.getPointByClient(ev.clientX, ev.clientY);

  const newNode = {
    id: `ManualAddNode-${addedNodeCount}`,
    x: modelPosition.x,
    y: modelPosition.y,
  };
  const node = this.graph.addItem('node', newNode);
  data.nodes.push(newNode);
  addedNodeCount++;
  
}
});


const graph = new G6.Graph({
container: 'mountNode', 
  width: window.innerWidth / 2, // Set initial width to viewport width
  height: window.innerHeight / 1.3, // Set initial height to viewport height
modes: {
  default: ['zoom-canvas', 'drag-canvas', 'drag-node'],
  addNode: ['click-add-node', 'click-select'],
  addEdge: ['click-add-edge', 'click-select'],
  select: ['click-select']
},
plugins: [contextMenu],  
defaultNode: {
  size: 50,
  type: 'circle',
  style: {
    fill: 'transparent',
    stroke: '#5B8FF9',
  },
},
});


let startPan = { x: 0, y: 0 };
let draggedX;
let draggedY;
let draged = false; 

graph.on('canvas:dragstart', e => {
  // Capture the initial pan values directly from the event if available, or use a fallback
  const position = graph.getPointByClient(e.clientX, e.clientY);
  startPan = {
    x: position.x,
    y: position.y
  };
  draged = true;
});

graph.on('canvas:dragend', e => {
  // Attempt to capture the final pan values directly from the event, with a fallback
  const position = graph.getPointByClient(e.clientX, e.clientY);
  const endPan = {
    x: position.x,
    y: position.y
  };

  // Calculate the distances dragged
  draggedX = endPan.x - startPan.x + 50;
  draggedY = endPan.y - startPan.y + 50;
});




function applyCanvasState() {
  graph.zoomTo(1); // Apply the zoom level
  graph.moveTo(draggedX, draggedY); // Apply the panning
}




function addNodeManual(element) {
  let newNode = {
    id: `ManualAddNode-${addedNodeCount}`,
    x: manualAddNodePosition.x,
    y: manualAddNodePosition.y,
  };

  if (headerText === 'NODE ContextMenu') { 
    newNode = {
      id: `ManualAddNode-${addedNodeCount}`,
      x: currentElement.item._cfg.model.x + 70,
      y: currentElement.item._cfg.model.y,
    };
    let clickedNodeId = currentElement.item._cfg.id;
    let newManualNodeId = `ManualAddNode-${addedNodeCount}`;
    const newEdge = {
      source: clickedNodeId,
      target: newManualNodeId, 
    };
    data.edges.push(newEdge);
  }
  data.nodes.push(newNode);
  graph.data(data);
  graph.render();
  if (draged) {
    applyCanvasState();
  }
  addedNodeCount = addedNodeCount + 1;
}


function updateNodeColor(color) {
// Check if a node is selected
if (currentElement && currentElement.item && currentElement.item.getType() === 'node') {
  // Get the ID of the selected node
  const selectedNodeId = currentElement.item._cfg.id;

  // Find the node in the data object and update its stroke color
  data.nodes.forEach(node => {
    if (node.id === selectedNodeId) {
      // Check if the node has a style object, if not, create one
      if (!node.style) {
        node.style = {};
      }
      // Update the stroke color
      node.style.stroke = color;
      node.style.fill = color;
    }
  });

  // Refresh the graph with the updated data
  graph.data(data);
  graph.render();
}
}

function updateEdgeColor(color) {
if (currentElement && currentElement.item && currentElement.item.getType() === 'edge') {
  const selectedEdgeId = currentElement.item._cfg.id;

  data.edges.forEach(edge => {
    if (edge.id === selectedEdgeId) {
      // Check if the node has a style object, if not, create one
      if (!edge.style) {
        edge.style = {};
      }
      // Update the stroke color
      edge.style.stroke = color;
    }
  });

  // Refresh the graph with the updated data
  graph.data(data);
  graph.render();
}
}

function updateEdgeWidth(width) {
// Check if an edge is selected
if (currentElement && currentElement.item && currentElement.item.getType() === 'edge') {
  // Get the ID of the selected edge
  const selectedEdgeId = currentElement.item._cfg.id;

  // Find the edge in the data object and update its lineWidth
  data.edges.forEach(edge => {
    // Direct comparison with edge id
    if (edge.id === selectedEdgeId) {
      // Check if the edge has a style object, if not, create one
      if (!edge.style) {
        edge.style = {};
      }
      // Update the lineWidth
      edge.style.lineWidth = parseInt(width, 10); // Ensure the width is an integer
    }
  });

  // Refresh the graph with the updated data
  graph.data(data);
  graph.render();
}
}

function updateNodeWidth(width) {
if (currentElement && currentElement.item && currentElement.item.getType() === 'node') {
  const selectedNodeId = currentElement.item._cfg.id;
  data.nodes.forEach(node => {
    if (node.id === selectedNodeId) {
      if (!node.style) {
        node.style = {};
      }
      node.style.lineWidth = parseInt(width, 10); 
    }
  });

  // Refresh the graph with the updated data
  graph.data(data);
  graph.render();
}
}


function deleteNode() {
const nodeIdToRemove = currentElement.item._cfg.id;
data.nodes = data.nodes.filter(node => node.id !== nodeIdToRemove);
data.edges = data.edges.filter(edge => edge.source !== nodeIdToRemove && edge.target !== nodeIdToRemove);

graph.data(data);
graph.render();
}

// Step 1: Define a Function to Determine Node Shape
function determineNodeShape(text) {
let shape = 'circle'; // Default shape
let size = [50, 50]; // Default size

if (text.length < 10) {
  shape = 'circle';
  size = [50, 50]; // Adjust size as needed to fit the text
} else if (text.length < 20) {
  shape = 'ellipse';
  size = [75, 50]; // Wider shape to accommodate longer text
} else {
  shape = 'rect';
  size = [150, 50]; // Rectangle for even longer text
}

return { shape, size };
}

// Step 2: Modify the Double-click Event Handler
function onNodeDoubleClick(ev) {
const node = ev.item;
const nodeId = node.getID();
const newLabel = prompt("Enter new label:", node.getModel().label || "");

if (newLabel !== null) {
  const { shape, size } = determineNodeShape(newLabel);

  const nodes = data.nodes;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === nodeId) {
      nodes[i].label = newLabel;
      nodes[i].type = shape;
      nodes[i].size = size;
      break; 
    }
  }

  graph.data(data);
  graph.render();
}
}

function onEdgeDoubleClick(ev) {
const edge = ev.item;
const edgeId = edge.getID();
const newLabel = prompt("Enter new label:", edge.getModel().label || "");

if (newLabel !== null) {
  // Update the edge label in the data array
  const edges = data.edges;
  for (let i = 0; i < edges.length; i++) {
    if (edges[i].id === edgeId) {
      edges[i].label = newLabel;
      break; 
    }
  }
  

  graph.data(data);
  graph.render();
}
}





// Register the Double-click Event
graph.on('node:dblclick', onNodeDoubleClick);
graph.on('edge:dblclick', onEdgeDoubleClick);

graph.data(data);
graph.render();

function validateData(jsonData) {
  if (typeof jsonData !== 'object' || jsonData === null || !Array.isArray(jsonData.nodes) || !Array.isArray(jsonData.edges)) {
    console.error("Invalid data: Data must be an object containing nodes and edges arrays.");
    return false;
  }

  // Filter out null values from the edges array
  const filteredEdges = jsonData.edges.filter(edge => edge !== null);
  jsonData.edges = filteredEdges; // Replace the original edges array with the filtered one

  const nodeIds = new Set(jsonData.nodes.map(node => node.id));

  for (const edge of jsonData.edges) {
    if (typeof edge !== 'object' || edge === null) {
      console.error("Invalid edge: Each edge must be an object.", edge);
      return false;
    }
    if (!('source' in edge) || !('target' in edge)) {
      console.error("Invalid edge: edge must contain source and target properties.", edge);
      return false;
    }
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      console.error(`Invalid edge: source or target id doesn't match any node id. Edge:`, edge);
      return false;
    }
  }

  return true; // Data is valid
}




document.getElementById('fileElem').addEventListener('change', function(event) {
  const files = event.target.files;
  let maxId = -1; 
  if (files.length > 0) {
    const file = files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
      const jsonData = JSON.parse(e.target.result);
    
      // Validate the uploaded JSON data before proceeding
      if (!validateData(jsonData)) {
        // If the data is invalid, log an error and do not proceed
        console.error("Uploaded JSON data is invalid.");
        return;
      }
    
      data = jsonData; // Replace existing data if valid
      data.nodes.forEach(node => {
        if (node.id.startsWith('ManualAddNode-')) {
          const idNumber = parseInt(node.id.split('-')[1], 10);
          if (!isNaN(idNumber)) {
            maxId = Math.max(maxId, idNumber);
          }
        }
      });
      addedNodeCount =  maxId + 1; 
      graph.data(data); // Update the graph data
      graph.render(); // Re-render the graph
    };
    

    reader.onerror = function(e) {
      console.error("Error reading file:", e.target.error);
    };

    reader.readAsText(file);
  }
});



document.addEventListener('DOMContentLoaded', function() {
  const reloadButton = document.getElementById('reload-btn');

  reloadButton.addEventListener('click', function() {
      // Display a confirmation dialog
      const confirmClear = confirm("Are you sure you want to delete all mindmap values?");

      // If the user clicks "Yes", clear the mindmap data
      if (confirmClear) {
          data = {nodes: [], edges: [] };
          addedNodeCount = 0;
          graph.data(data); // Update the graph data
          graph.render(); // Re-render the graph
      }
  });
});




// 更新 'default' 模式下的 behavior 'zoom-canvas'
graph.updateBehavior('zoom-canvas', { sensitivity: 1.5, enableOptimize: true}, 'default');

// 更新 'select' 模式下的 behavior 'click-select'
graph.updateBehavior('click-select', { trigger: 'ctrl' }, 'select');

document.getElementById('selector').addEventListener('change', e => {
const value = e.target.value;
graph.setMode(value);
});


const getCircularReplacer = () => {
const seen = new WeakSet();
return (key, value) => {
  if (typeof value === "object" && value !== null) {
    if (seen.has(value)) {
      // Replace circular reference with something else, or remove it
      return;
    }
    seen.add(value);
  }
  return value;
};
};


document.getElementById('download-btn').addEventListener('click', function() {
const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, getCircularReplacer()));
const downloadAnchorNode = document.createElement('a');
downloadAnchorNode.setAttribute("href", dataStr);
downloadAnchorNode.setAttribute("download", "data.json"); // Name of the file to be downloaded
document.body.appendChild(downloadAnchorNode); // Required for Firefox
downloadAnchorNode.click();
downloadAnchorNode.remove();
});
