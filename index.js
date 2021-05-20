const Base_URL = 'https://movie-list.alphacamp.io'
const Index_URL = Base_URL + '/api/v1/movies/'
const Poster_URL = Base_URL + '/posters/'
const movies = []
let filteredMovies = []
const MOVIES_PER_PAGE = 12
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderMovieList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    //title, image
    rawHTML += `<div class="col-sm-3" >
        <div class="mb-2" >
          <div class="card" >
            <img
              src="${Poster_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movieModal" data-id = '${item.id}'>More</button>
              <button class="btn btn-info btn-add-favorite" data-id = '${item.id}'>+</button>
            </div>
          </div>
        </div>
      </div>`
  })

  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE) //ceil()可以無條件進位
  let rawHTML = ''

  for (let page = 0; page < numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = '${page + 1}'>${page + 1}</a></li>`
  }  //要綁在超連結的上面
  paginator.innerHTML = rawHTML
}


// 點按page時，會選取我要的那部分的電影資料的位置
function getMoviesByPage(page) {
  //我們要抓取的資料不一定是movies這個陣列，因為使用搜尋的話會用到filteredMovies所以
  const data = filteredMovies.length ? filteredMovies : movies
  const moviesIndexStart = (page - 1) * MOVIES_PER_PAGE
  return data.slice(moviesIndexStart, moviesIndexStart + MOVIES_PER_PAGE)
}


function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(Index_URL + id).then(response => {
    const data = response.data.results  //code會比較整齊
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date:' + ' ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${Poster_URL + data.image}" alt="movie-poster"
    class="image-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const favorMovie = movies.find(oneData => {
    return oneData.id === id  //因為字串與數字型態不同所以一定要先把id數字化
  })

  if (list.some(oneData => oneData.id === id)) {
    return alert('This movie already exists ！ :)') //因為return了所以不會在執行以下的函式！
  }

  list.push(favorMovie)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))

}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPageClick(event) {
  if (event.target.tagName === 'A') {  //tagName若為HTML則要寫大寫
    const page = Number(event.target.dataset.page)
    renderMovieList(getMoviesByPage(page))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  // if (!keyword.length) {
  //   return alert('Please enter a valid string')
  // }

  //在 include() 中傳入空字串，所有項目都會通過篩選）
  filteredMovies = movies.filter(movie => {
    return movie.title.toLowerCase().includes(keyword)
  })

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword :' + keyword)
  }

  // 第一種用法，for...of會迭代陣列的value，而我們的movies陣列中的value就是那些電影的資訊！
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }


  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))

})


axios.get(Index_URL).then((response) => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
})
  .catch((err) => console.log(err))



