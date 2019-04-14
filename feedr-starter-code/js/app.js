// global variable and function
var feed = [];
var articalsSection = document.getElementById("main");
var sources = [
  {
    key: "digg",
    title: "Digg",
    link: "http://digg.com/api/news/popular.json"
  },
  {
    key: "reddit",
    title: "Reddit",
    link: "https://www.reddit.com/top.json"
  },
];
// handel create and appending to html
var template = {
  createUl: (sources, parent) => {
    let html = (key, title, href) => {
      return `
        <li>
            <a onclick="onSourceClick(event)" class="sourceMenuLink" id="${key}" href="${href}">${title}</a>
        </li>
      `;
    };
    sources.forEach(source => {
      let liHtml = html(source.key, source.title, "#");
      parent.insertAdjacentHTML("beforeend", liHtml);
    });
  },
  createArticles: (feed, parent) => {
    let html = (index, title, imageSrc, articleURL, category) => {
      return `
      <article onclick="onArticleClick(event,${index})" id=${index} class="article">
      <section class="featuredImage">
        <img src="${imageSrc}" alt="" />
      </section>
      <section class="articleContent">
          <a href="#"><h3>${title}</h3></a>
          <h6>${category}</h6>
      </section>
      <section class="impressions">
        526
      </section>
      <div class="clearfix"></div>
      </article>
    `;
    };
    
    feed.forEach((feed, index) => {
      let articalHtml = html(
        index,
        feed.title,
        feed.image,
        feed.url,
        feed.category
      );
      parent.insertAdjacentHTML("beforeend", articalHtml);
    });
  }
};
// main function that will fetch api then append to html
function refreshFeed(source) {

  document.getElementById('sourceName').innerText = source.title

  $("#popUp").removeClass("hidden");
  api
    .getNews(source)
    .then(data => {
      rowData = data;
      feed = getCleanData(source, rowData);
      template.createArticles(feed, articalsSection);
      $("#popUp").addClass("hidden");
    })
    .catch(e => {
      console.log(e);
      $("#popUp").addClass("hidden");
    });
}
var api = {
  getNews: source => {
    try {
      return fetch(source.link)
        .then(res => res.json())
        .then(json => json.data);
    } catch (e) {
      console.log(e);
    }
  }
};
function getCleanData(source, rowData) {
  // img , news link , description , topic

  let cleanData = [];
  if (source.key == "digg") {
    rowData.feed.forEach(element => {
      let feedObj = {};
      feedObj.title = element.content.title;
      feedObj.url = element.content.url;
      feedObj.image = element.content.media.images[0].url;
      feedObj.description = element.content.description;
      tags = [];
      element.content.tags.forEach(tag => {
        tags.push(tag.name);
      });
      feedObj.category = tags.join();

      cleanData.push(feedObj);
    });
    return cleanData;
  } else if (source.key == "reddit") {
    rowData.children.forEach(element => {
      let feedObj = {};
      feedObj.title = element.data.title;
      feedObj.url = "https://www.reddit.com/" + element.data.permalink;
      feedObj.image = element.data.thumbnail;
      feedObj.description = element.data.title;
      if (element.data.content_categories) {
        feedObj.category = element.data.content_categories.join();
      } else {
        feedObj.category = "";
      }

      cleanData.push(feedObj);
    });
    return cleanData;
  }
}



  // main

(function() {

  var sourcesUl = document.getElementById("sourcesUl");
  template.createUl(sources, sourcesUl);
  var source = sources[0];
  refreshFeed(source);
})();

// events handling

function onSourceClick(e) {
  const key = e.target.id;
  let source = sources.find(src => src.key == key);
  articalsSection.innerHTML = "";
  refreshFeed(source);
}

function onArticleClick(e, index) {
  e.preventDefault();
  let article = feed[index];
  $("#popUp h1").html(article.title);
  $("#popUp p").html(article.description);
  $(".popUpAction").attr("href", article.url);
  $("#popUp").removeClass("loader hidden");
}

$(".closePopUp").click(function(e) {
  e.preventDefault();
  $("#popUp").addClass("loader hidden");
});


