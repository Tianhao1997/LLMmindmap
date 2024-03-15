        document.getElementById('fileElem').addEventListener('change', function(e) {
          handleFiles(this.files); // Function to handle files after selection
        });

        function handleFiles(files) {
          // Process the selected files here
          console.log(files);
        }


      
      
      // 定义数据源
      const data = {
        // 点集
        nodes: [
          {
            id: 'node1',
            x: 100,
            y: 200,
          },
          {
            id: 'node2',
            x: 300,
            y: 200,
            label: 'text here',
          },
        ],
        // 边集
        edges: [
          // 表示一条从 node1 节点连接到 node2 节点的边
          {
            source: 'node1',
            target: 'node2',
          },
        ],
      };

          
      let addedNodeCount = 0;
      let currentElement = {}; 
      let headerText = '';

      const contextMenu = new G6.Menu({
        getContent(evt) {
          let header;
          let content = '';
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
          <button class="manualAddNodeButton" onclick="
            addNodeManual(this);
          ">Manual Add</button><br>

          <button>Auto Add</button><br>

          <button onclick='
            deleteNode();
          '>Delete</button><br>

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
          <button class="manualAddNodeButton" onclick="
            addNodeManual(this);
          ">Manual Add</button><br>

          <button>Auto Add</button><br>

          <button onclick='
            deleteNode();
          '>Delete</button><br>

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
        // 需要加上父级容器的 padding-left 16 与自身偏移量 10
        offsetX: 16 + 10,
        // 需要加上父级容器的 padding-top 24 、画布兄弟元素高度、与自身偏移量 10
        offsetY: 0,
        // the types of items that allow the menu show up
        // 在哪些类型的元素上响应
        itemTypes: ['node', 'edge', 'canvas'],
      });





    G6.registerBehavior('click-add-edge', {
      getEvents() {
        return {
          'node:click': 'onClick',
          mousemove: 'onMousemove',
          'edge:click': 'onEdgeClick' // 点击空白处，取消边
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
          // graph.setItemState(this.edge, 'selected', true);
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
        // 拖拽过程中，点击会点击到新增的边上
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
        const newNode = {
          id: `ManualAddNode-${addedNodeCount}`,
          x: ev.canvasX,
          y: ev.canvasY,
        };
        const node = this.graph.addItem('node', newNode);
        data.nodes.push(newNode);
        addedNodeCount++;
        
      }
    });

    // 创建 G6 图实例
    const graph = new G6.Graph({
      container: 'mountNode', // 指定图画布的容器 id，与第 9 行的容器对应
      // 画布宽高
      width: 800,
      height: 500,
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



    function addNodeManual(element) {
      let rect = element.getBoundingClientRect();

      const newNode = {
        id: `ManualAddNode-${addedNodeCount}`,
        x: rect.x,
        y: rect.y,
      };
      data.nodes.push(newNode);

      if (headerText === 'NODE ContextMenu') { 
        let clickedNodeId = currentElement.item._cfg.id;
        let newManualNodeId = `ManualAddNode-${addedNodeCount}`;
        const newEdge = {
          source: clickedNodeId,
          target: newManualNodeId, 
        };
        data.edges.push(newEdge);
    }

      graph.data(data);
      graph.render();
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
      // 读取数据
      graph.data(data);
      // 渲染图
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
        size = [100, 50]; // Rectangle for even longer text
      }

      return { shape, size };
    }

    // Step 2: Modify the Double-click Event Handler
    function onNodeDoubleClick(ev) {
      const node = ev.item;
      const nodeId = node.getID();
      const label = prompt("Enter new label:", node.getModel().label || "");

      if (label !== null) {
        const { shape, size } = determineNodeShape(label);

        // Step 3: Update the Node with New Shape and Label
        graph.updateItem(node, {
          label: label,
          type: shape, // Update node shape
          size: size // Update node size
        });

        // Refresh the graph to reflect the changes
        graph.refresh();
      }
    }

    function onEdgeDoubleClick(ev) {
      const edge = ev.item;
      const edgeId = edge.getID();
      const label = prompt("Enter new label:", edge.getModel().label || "");

      if (label !== null) {
        graph.updateItem(edge, {
          label: label,
        });

        // Refresh the graph to reflect the changes
        graph.refresh();
      }
    }

  
    
    

    // Register the Double-click Event
    graph.on('node:dblclick', onNodeDoubleClick);
    graph.on('edge:dblclick', onEdgeDoubleClick);

    // 读取数据
    graph.data(data);
    // 渲染图
    graph.render();


    // 更新 'default' 模式下的 behavior 'zoom-canvas'
    graph.updateBehavior('zoom-canvas', { sensitivity: 1.5, enableOptimize: true}, 'default');

    // 更新 'select' 模式下的 behavior 'click-select'
    graph.updateBehavior('click-select', { trigger: 'ctrl' }, 'select');
    
    document.getElementById('selector').addEventListener('change', e => {
      const value = e.target.value;
      graph.setMode(value);
    });



    document.getElementById('download-btn').addEventListener('click', function() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "data.json"); // Name of the file to be downloaded
      document.body.appendChild(downloadAnchorNode); // Required for Firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    });
    