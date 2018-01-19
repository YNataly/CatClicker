(function(){
  let model={
    catsData : [
    {name: "Toby"  ,url: "images/cat1_600_397.jpg", description: "Portrait Of A Tabby Cat (from  Dreamstime.com)"},
    {name: "Quincy",url: "images/cat2_600_400.jpg", description: "Hairless Cat, Sphynx(from  Dreamstime.com)"},
    {name: "Oreo"  ,url: "images/cat3_640.jpg",     description: "Black cute kitty"},
    {name: "Cleo"  ,url: "images/cat4_640.jpg",     description: "Sweet Home Cat"},
    {name: "Dante" ,url: "images/cat5_640.jpg",     description: "I am BLACK"},
    {name: "Tiger" ,url: "images/cat6_640.jpg",     description: "Predator cat"}],
    
    init: function() {

       this.currentCat=null;       
       this._idCounter=0;
       this.cats=new Map();

      for(let cat of this.catsData) {
        this.addCat(cat);
      }
      
    },

    [Symbol.iterator]: function() {
      return this.cats.values();
       }, 

    getCat: function(id) {
      return this.cats.get(id);
    },

    addCat: function ({name, url, description=""}){
      this.cats.set(this._idCounter, {name, url, description, counter:0, id: this._idCounter});
      this._idCounter++;
        }

      };
   


  let listView={
    
    init: function() {
      this.listPanelWrapper= document.querySelector(".list-panel-wrapper");
      this.listPanel= this.listPanelWrapper.querySelector(".list-panel");
     

       for(let c of octo.getCatsList())
          { this.addListItem(c); //c.name, c.url, c.description, c.counter);
           }

      if (cardView.panel)
        this.listPanel.addEventListener("click", function(event){
          let target=event.target;
          if (target.tagName!=="LI") return;
      
          octo.setCurrentCat(+target.dataset.id);
         });
      else console.log("No .picture-panel element");
   },

   addListItem: function ({name="unknown", id}={}){
    let li=document.createElement("li");
    li.dataset.id=id;
    li.innerHTML=name;
    this.listPanel.appendChild(li);
    return li;
     },

     selectCat: function(ind) {
        try{
        this.listPanel.children[ind].dispatchEvent(new MouseEvent("click", {bubbles: true}));
      }
      catch(err){
        console.log(err, " ind: ", ind);
      }
     },

     showListPanel: function() {
      this.listPanelWrapper.style.height=this.listPanel.clientHeight+"px";
     },

     hideListPanel: function() {
      this.listPanelWrapper.style.height="";
     }
  };


  let cardView={
    
    init: function() {
      this.panel=document.querySelector(".card .picture-panel");
    
      this.card= {
       counter : this.panel.querySelector(".counter-panel .counter"),
       caption:  this.panel.querySelector("figcaption"),
       desc:     this.panel.querySelector(".picture-description"),
        img:     this.panel.querySelector("img")
      };
    },

    showCat: function (cat) {
      
      function createCounter(el) {
        return function () {
          octo.incCatCounter(cat);
          el.innerHTML = cat.counter;
          };
      }
      
      this.card.img.onclick=createCounter(this.card.counter);
      this.card.img.src=cat.url;
      this.card.caption.innerHTML=cat.name;
      this.card.desc.innerHTML=cat.description;
      this.card.counter.innerHTML=cat.counter;

      if (adminView.visible)
          adminView.render();
    }

  };


let adminView={
  init: function() {
    this.adminPanel=document.querySelector(".admin-panel");
    this.adminForm=document.forms["adminForm"];
    this.adminForm.onsubmit=function() {return false;};
    this.adminPanel.querySelector("button.Save").addEventListener("click", function() {adminView.save();});
    this.adminPanel.querySelector("button.Cancel").addEventListener("click", function() {adminView.cancel();});
    this.visible=false;
  },

  show: function() {
    this.visible=true;
    this.render();
  },

  render: function() {
   let cat=octo.getCurrentCat();
    if(!cat) return;
    this.adminForm.id.value=cat.id;
    this.adminForm.catName.value=cat.name;
    this.adminForm.URL.value=cat.url;
    this.adminForm.clicks.value=cat.counter;
    this.adminForm.description.value=cat.description;

    this.adminPanel.style.display="block";
  },

  renderCounter: function(val) {
    this.adminForm.clicks.value=val;
  },

  save: function() {
    let cat=octo.getCurrentCat();
    if(!cat) return;
    this.visible=false;
    cat.name=this.adminForm.catName.value;
    cat.url=this.adminForm.URL.value;
    cat.counter=+this.adminForm.clicks.value;
    cat.description=this.adminForm.description.value;
    this.adminPanel.style.display="none";
    octo.updateCurrentCat();
  },

  cancel: function() {
    this.visible=false;
    this.adminPanel.style.display="none";
  }
  

};

  let navigationView={
    toggleCatList: function(event) {
     // if(adminView.visible) return;
      event && event.preventDefault();

      if(!this.catListVisible){
        this.catListVisible=true;
        document.addEventListener("click", this.hideMenu);
        listView.showListPanel();
      }
      else {
        this.catListVisible=false;
        listView.hideListPanel();
      }
      
   },

   hideMenu: function(event) {
     if(event.defaultPrevented)
      return;
    document.removeEventListener("click", this.hideMenu);
    if (navigationView.catListVisible)
      navigationView.toggleCatList();
   },

    init: function() {
      this.nav=document.querySelector("header nav");
      
      this.catListVisible=false;
      
      this.nav.querySelector("button.selectCat").addEventListener("click",event => this.toggleCatList(event));
      this.nav.querySelector("button.admin").addEventListener("click",() => {
        if (this.catListVisible) return;
        adminView.show();});
    }

    
    
  }

  let octo={
    init: function() {
       model.init();
       cardView.init();
       listView.init();
       adminView.init();
       navigationView.init();
      
       listView.selectCat(0);
    },

    getCurrentCat: function() {
      return model.currentCat;
    },

    getCatsList: function() {
        return model;
    },

    incCatCounter: function(cat){
       ++cat.counter;
       if(adminView.visible)
          adminView.renderCounter(cat.counter);
    },

    setCurrentCat: function(id) {
      let cat=model.getCat(id);
      if (!cat) return;
      model.currentCat=cat;
      cardView.showCat(cat);
    },

    updateCurrentCat: function() {
      cardView.showCat(model.currentCat);
    }

  };

  octo.init();


})();
 





