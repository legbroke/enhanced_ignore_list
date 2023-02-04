const IGNORED_USER = 'Ignored user';
const SUBJECT_HIDDEN = 'Subject hidden';

chrome.storage.local.get('ignoreList', function(items) {
    const ignoreList = [...new Set(items.ignoreList.split('\n'))].filter(n=>n);
    console.log("ignoreList", ignoreList);
    
    if (location.href.match(/usercp\.php/)) {
        // First, remove any CP reputation entries
        let userCpRepClass = '[class^="floatcontainer blockrow summaryinfo"]';
        let userCpRepNodes = document.querySelectorAll(userCpRepClass);
        userCpRepNodes.forEach(node=> {
            let userClass = 'div.user';
            let userNode = node.querySelector(userClass);

            if (userNode != null) {
                if (ignoreList.includes(userNode.textContent.trim())) {
                    node.parentElement.removeChild(node);
                }
            }
        });

        // Second, remove any references to users in the "last post by" of subscribed threads
        let userCpPostClass = 'a.username.popupctrl';
        let userCpPosts = document.querySelectorAll(userCpPostClass);
        userCpPosts.forEach(node=> {
            if (node != null) {
                if (ignoreList.includes(node.textContent.trim())) {
                    node.parentElement.removeChild(node);
                }
            }
        });

        // Third, hide the subject lines of any PM notifications
        let subjectClass = 'a.title';
        let newMessageUserClass = 'ol.commalist';
        let newMessageUsers = document.querySelectorAll(newMessageUserClass);
        newMessageUsers.forEach(node=> {
            if (node != null) {
                if (ignoreList.includes(node.textContent.trim())) {
                    node.textContent = IGNORED_USER;
                    let subjectNode = node.parentElement.parentElement.querySelector(subjectClass);
                    if (subjectNode != null) {
                        subjectNode.textContent = SUBJECT_HIDDEN;
                    }
                }
            }
        });
    }
    else if (location.href.match(/showthread\.php/)) {
        // first remove any posts that are on a user's bb.com ignorelist
        let ignorePostClass = 'li.postbitignored.postbitim';

        let ignorePosts = document.querySelectorAll(ignorePostClass);
        for (let i = 0; i < ignorePosts.length; i++) {
            let post = ignorePosts.item(i);
            post.parentElement.removeChild(post);
        }

        // used for getting posts from a thread
        let postClass = 'li.postbitlegacy.postbitim.postcontainer';

        // used for finding author of each post
        let userTitleClass = 'a.username.popupctrl';
        let quoteClass = 'div.bbcode_postedby';
        let quoteAuthorClass = 'strong';

        // used for determing whether a post is empty (and should be removed)
        let contentClass = 'div.content';

        let posts = document.querySelectorAll(postClass);
        for (let i = 0; i < posts.length; i++) {
            let post = posts.item(i);
            let userTitleNode = post.querySelector(userTitleClass);
            let removedText = false;

            if (userTitleNode != null) {
                if (ignoreList.includes(userTitleNode.textContent.trim())) {
                    post.parentElement.removeChild(post);
                }
                else {
                    let quotes = post.querySelectorAll(quoteClass);
                    for (let j = 0; j < quotes.length; j++) {
                        let quote = quotes.item(j);
                        let quoteAuthorNode = quote.querySelector(quoteAuthorClass);
                        if (quoteAuthorNode != null) {
                            if (ignoreList.includes(quoteAuthorNode.textContent.trim())) {
                                let postTextNode = quote.parentElement.parentElement.parentElement.parentElement;
                                if (postTextNode != null) {
                                    let childNodes = postTextNode.childNodes;
                                    let shouldRemove = false;
                                    let indicesToRemove = []
                                    for (let k = 0; k < childNodes.length; k++) {
                                        if (childNodes[k].nodeName == "DIV") {
                                            let quoteAuthorNode2 = childNodes[k].querySelector(quoteAuthorClass);
                                            if (quoteAuthorNode2 != null) {
                                                let author2 = quoteAuthorNode2.textContent.trim();
                                                if (ignoreList.includes(author2)) {
                                                    shouldRemove = true;
                                                }
                                                else {
                                                    shouldRemove = false;
                                                }
                                            }
                                        }
                                        if (shouldRemove) {
                                            childNodes[k].parentElement.removeChild(childNodes[k]);
                                            removedText = true;
                                            k--;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (removedText) {
                        let contentNode = post.querySelector(contentClass);
                        if (contentNode == null) {
                            post.parentElement.removeChild(post);
                        }
                        else {
                            let content = contentNode.textContent.trim();
                            if (content == '') {
                                post.parentElement.removeChild(post);
                            }
                        }
                    }
                }
            }
        }
    }
    else if (location.href.match(/forumdisplay\.php/)) {
        let getSearchButtonSrc = document.querySelector('.buttoncontainer .searchbutton').getAttribute('src')
        let isThemeBlack = (getSearchButtonSrc.split('/')[1] === 'BP-Black')
        let threadTableClass = 'table.threadinfo-table';
        let threadClass = isThemeBlack ? '.threadbit .nonsticky' : 'td.td-title'
        let threadAuthorClass = 'div.author';
        let usernameClass = 'a.username.understate';
        let lastPostedClass = 'a.username.popupctrl';

        let threads = document.querySelectorAll(threadClass);
        for (let i = 0; i < threads.length; i++) {

            let thread = threads.item(i);
            let threadAuthorNode = thread.querySelector(threadAuthorClass);

            if (threadAuthorNode != null) {

                let usernameNode = threadAuthorNode.querySelector(usernameClass);
                if (usernameNode != null) {
                    if (ignoreList.includes(usernameNode.textContent.trim())) {
                        thread.parentElement.parentElement.removeChild(thread.parentNode);
                    }
                    else {
                        let lastPostedNode = thread.parentNode.querySelector(lastPostedClass);
                        if (lastPostedNode != null) {
                            if (ignoreList.includes(lastPostedNode.textContent.trim())) {
                                lastPostedNode.parentElement.removeChild(lastPostedNode);
                            }
                        }
                    }
                }
            }
        }
    }
    else if (location.href.match(/private\.php/)) {
        let usernameClass = 'a.username.understate';
        let subjectClass = 'a.title';
        let messageAuthors = document.querySelectorAll(usernameClass);
        for (let i = 0; i < messageAuthors.length; i++) {
          let messageAuthorNode = messageAuthors.item(i);
          if (ignoreList.includes(messageAuthorNode.textContent.trim())) {
              messageAuthorNode.textContent = IGNORED_USER;
              let subjectNode = messageAuthorNode.parentElement.parentElement.parentElement.querySelector(subjectClass);
              subjectNode.textContent = SUBJECT_HIDDEN;
          }
        }
    }
});