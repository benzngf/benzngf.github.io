var expanded = false;
        var btns = [document.getElementById("link0"),
        document.getElementById("link1"),
        document.getElementById("link2"),
        document.getElementById("link3"),
        document.getElementById("link4"),
        document.getElementById("link5"),
        document.getElementById("link6")];
        var welcomeMsg = document.getElementById("welcomeMsg");
        var expanding = -1;
        function expandBtns(){
            expanding = 0;
            for(i = 0; i < btns.length; i++){
                window.setTimeout(function(){
                    if(expanding >= 0 ){
                        btns[expanding].style.transform = "translate(-50%, -50%) scale(1.0,1.0)";
                        btns[expanding].style.top = ""+(50-Math.cos(2*Math.PI*expanding/btns.length)*38)+"%";
                        btns[expanding].style.left = ""+(50+Math.sin(2*Math.PI*expanding/btns.length)*38)+"%";
                        expanding++;
                    }
                }, 80*i);
            }
            welcomeMsg.style.bottom = "10%";
            //console.log("expand\n");
        }
        function collapseBtns(){
            expanding = -100;
            for(i = 0; i < btns.length; i++){
                btns[i].style.transform = "translate(-50%, -50%) scale(0,0)";
                btns[i].style.top = "50%";
                btns[i].style.left = "50%";
            }
            welcomeMsg.style.bottom = "24%";
            //console.log("collapse\n");
        }
        function expandHandle(event){
            switch(event.type){
                case "click":
                    if(expanded == true){
                        collapseBtns();
                        expanded = false;
                    }else{
                        expandBtns();
                        expanded = true;
                    }
                break;
                case "mouseleave":
                    if(expanded == true){
                        collapseBtns();
                        expanded = false;
                    }
                break;
                case "mouseenter":
                    if(expanded == false){
                        window.setTimeout(expandBtns, 100);
                        expanded = true;
                    }
                break;
                default:
                console.log("undefined event\n");
                break;
            }
        }
        function btnhover(event){
            if(expanded==true){
                switch(event.type){
                    case "mouseleave":
                        event.target.style.transform = "translate(-50%, -50%) scale(1.0,1.0)";
                    break;
                    case "mouseenter":
                        event.target.style.transform = "translate(-50%, -50%) scale(1.2,1.2)";
                    break;
                    default:
                        console.log("undefined event\n");
                    break;

                }
            }
        }
        document.getElementById("mylogoImg").addEventListener("click", expandHandle);
        document.getElementById("mylogoImg").addEventListener("mouseenter", expandHandle);
        document.getElementById("mylogo").addEventListener("mouseleave", expandHandle);
        for(i = 0; i < btns.length; i++){
            btns[i].addEventListener("mouseenter", btnhover);
            btns[i].addEventListener("mouseleave", btnhover);
        }