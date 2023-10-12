"use strict";
import users  from './words_dictionary.json' assert {type: 'json'}  // import words from json file

const words = Object.keys(users) // creating an array of words


// Trie implementation
class TrieNode {
        children;
        isWord;
        word;
    
        constructor() {
                this.children = {};
                this.isWord = false;
        }
    
        insert(word) {
                let cur = this;
                
                for (const c of word) {
                        if (!cur.children[c]) {
                                cur.children[c] = new TrieNode();
                        }
                        cur = cur.children[c];
                }
                cur.word = word;
                cur.isWord = true;
        }
    
        findWords(word) {
                let cur = this;
                for (const c of word) {
                        if (!cur.children[c]) {
                                return [];
                        }
                        cur = cur.children[c];
                }
                
                let list = [];
                function dfs(node) {
                        if (node.isWord) {
                                list.push(node.word);
                        }
                        for (const child in node.children) {
                                dfs(node.children[child]);
                        }
                }
                
                // run dfs search to find every word, sort the list and return the top 3 
                dfs(cur);
                list.sort();
                return list.slice(0, 5);
        }
}

let trie = new TrieNode();
  
for (let word of words) {
        trie.insert(word)
}

// Trie implementation ends

const wrapper = document.querySelector(".wrapper")
const userWord = document.querySelector(".word-given-by-user");
const searchButton  = document.querySelector('i');
let ul = document.getElementById("items-with-common-prefix");
const infoText = document.querySelector(".info-text")
const synonyms = document.querySelector(".synonyms .list")
// const synonymItems = document.querySelector(".synonyms .list span")
const volumeIcon = document.querySelector(".word i")
let audio ;
searchButton.addEventListener('click', searchWord)
        
function data (result, word) {
        if(result.title) {
                infoText.innerHTML = `Sorry, Can't find the meaning of <span>"${word}"</span>`;
                document.querySelector(".word-meaning").style.display = "none";
        }
        else {
                // console.log(result)
                wrapper.classList.add("active")
                let definations = result[0].meanings[0].definitions[0];
                let phonetics = `${result[0].meanings[0].partOfSpeech}/ ${result[0].phonetics[0].text}/`;

                document.querySelector(".word p").innerText = result[0].word;
                document.querySelector(".word span").innerText = phonetics;
                document.querySelector(".meaning span").innerText = definations.definition;

                //handling audio
                let sound ;
                for(let i = 0 ;i < result[0].phonetics.length; i++) {
                        let currPhonetic = result[0].phonetics[i];
                        if(currPhonetic.hasOwnProperty("audio")  && currPhonetic.audio.length != 0) {
                                
                                sound = currPhonetic.audio;
                                break;
                        }
                }
                audio = new Audio( sound);
                //audio ends




                //Handling Examples
                let mean = result[0].meanings;
                let exmple ;
                let ok = 0;
                for(let i = 0 ; i < mean.length; i++) {
                        let defination = mean[i].definitions
                        for(let j = 0 ; j < defination.length; j++) {
                                let defination1 = defination[j];
                                if(defination1.hasOwnProperty("example")) {
                                        exmple = defination1.example
                                        ok = 1;
                                        break;
                                }
                        }
                        if(ok == 1) break;
                }
                document.querySelector(".example span").innerText = exmple;
                //examples end 







                //Handling Synonyms
                let index = 0 ;
                let maxi = 0 ;
                for(let ii = 0 ; ii <  result[0].meanings.length; ii++) {
                        if(result[0].meanings[ii].synonyms.length > maxi) {
                                maxi = result[0].meanings[ii].synonyms.length
                                index = ii;
                        }
                }
                if(maxi == 0) {
                        synonyms.parentElement.style.display = "none";

                }
                else {
                        synonyms.parentElement.style.display = "block";
                        synonyms.innerHTML = "";
                        let syn = result[0].meanings[index].synonyms
                        let i;
                        for(i = 0 ; i < 4 && i < syn.length - 1; i++) {
                                
                                let tag = `<span class = "synonym-span">${syn[i]},</span>`;
                                synonyms.insertAdjacentHTML("beforeend", tag)
                        }
                                let tag = `<span class = "synonym-span">${syn[i]}</span>`;
                                synonyms.insertAdjacentHTML("beforeend", tag)

                }
                //Synonyms End here

               


        }

}

//search synonyms function
synonyms.addEventListener("click", (e) => {
        let word = e.target.innerText;
        if(word[word.length - 1] == ',') 
        userWord.value = (word.slice(0, word.length-1))
        else userWord.value = word
        searchWord()
})

function searchWord() {
        ul.innerHTML = '';
        document.querySelector(".word-meaning").style.display = "block";
        fetchApi(userWord.value)

}

function fetchApi(word) {
        let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        try{
                fetch(url).then(res => res.json())
                .then(result => data(result, word));

        }
        catch(err) {
                console.log(err)
        }

}


function addWordList(props) {
        
        
        let li = document.createElement("li");
        li.appendChild(document.createTextNode( props));
        li.setAttribute("id", "list-items-item")
        ul.appendChild(li);
        li.addEventListener('click', (event) => {
                userWord.value = event.target.innerText;
                
        })
}

let inputWord = ""
userWord.addEventListener('keyup', (e) => {
        document.querySelector(".word-meaning").style.display = "none";
        infoText.innerHTML = ''
        if(e.key === "Enter" && e.target.value) {
                searchWord()
        }
        else {
                let prefix = e.target.value.toLowerCase();
                ul.innerHTML ='';
                let ans = trie.findWords(prefix);
                if(prefix.length == 0) return ;
                for(let i = 0 ; i < ans.length; i++) {
                        addWordList(ans[i]);
                }
        }
        

       
})


volumeIcon.addEventListener("click", (e) => {
        audio.play();
})