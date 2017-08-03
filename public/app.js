(function() {

  window.toggleDetails = function (i) {
    const details = document.querySelector('.details-' + i)
    details.classList.toggle('hide')

    const toggle = document.querySelector('.toggle-' + i)
    toggle.classList.toggle('expanded')
  }

  const debounce = function(callback, seconds) {
    let timeout = null
    return function () {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(callback, seconds)
    }
  }

  class SearchParameters {
    constructor () {
      this.element = document.querySelector('.tbx-search')
      this.categories = document.querySelectorAll('.categories input')
    }

    getValues () {
      const query = {}
      query.q = this.element.value
      query.laborTypes = Array.prototype.filter
        .call(this.categories, function (cat) { return cat.checked })
        .map(function (cat) { return cat.value })
        .join(',')
      return query
    }
  }

  class Search {
    constructor (params) {
      this.query = {
        q: '',
        laborTypes: ''
      }
      this.timeout = null
      this.paginator = params.paginator
      this.element = document.querySelector('.tbx-search')
      this.element.onkeyup = debounce(this.search.bind(this), 1000)
      this.categories = document.querySelectorAll('.categories input')
      this.searchParams = params.searchParams
      this.onSearch = params.search

      this.bind()
    }

    bind () {
      for (let i = 0; i < this.categories.length; i++) {
        this.categories[i].onclick = this.search.bind(this)
      }
    }

    search () {
      this.onSearch(0, this.searchParams.getValues())
    }
  }

  class Paginator {
    constructor (params) {
      this.page = 0
      this.step = 3
      this.limit = 10
      this.numOfPages = 0

      this.element = document.querySelector('.paginator')
      this.pages = document.querySelector('.pages')
      this.currentPageElement = document.querySelectorAll('.current-page')
      this.searchParams = params.searchParams
      this.onSearch = params.search

      this.setUpQuickNav()
    }

    setUpQuickNav () {
      const shortcutPager = document.createElement('div')
      shortcutPager.classList.add('shortcut-pager')

      const first = document.createElement('div')
      first.onclick = this.first.bind(this)
      first.classList.add('first')
      shortcutPager.append(first)

      const previous = document.createElement('div')
      previous.classList.add('previous')
      previous.onclick = this.previous.bind(this)
      shortcutPager.append(previous)

      const next = document.createElement('div')
      next.classList.add('next')
      next.onclick = this.next.bind(this)
      shortcutPager.append(next)

      const last = document.createElement('div')
      last.classList.add('last')
      shortcutPager.append(last)
      last.onclick = this.last.bind(this)

      this.element.append(shortcutPager)
    }

    onclick (idx) {
      if (idx !== this.page) {
        this.page = idx === 0 ? 0 : idx - 1
        const start = this.page * this.limit
        this.onSearch(start, this.searchParams.getValues())
      }
    }

    first () {
      this.onclick(0)
    }

    last () {
      this.onclick(this.numOfPages)
    }

    next () {
      if (this.page !== this.numOfPages - 1) {
        this.onclick(this.page + 2)
      }
    }

    previous () {
      if (this.page > 0) {
        this.onclick(this.page - 1)
      }
    }

    generatePages (total = 0) {
      const numOfPages = Math.ceil(total / this.limit)
      const pagedText = `Page ${numOfPages ? this.page + 1 : 0} of ${this.numOfPages}`

      this.numOfPages = numOfPages
      this.currentPageElement[0].textContent = pagedText

      if (numOfPages) {
        this.currentPageElement[1].textContent = pagedText
        this.currentPageElement[1].style = 'display: block;'
      } else {
        this.currentPageElement[1].style = 'display: none;'
      }

      this.pages.innerHTML = ''

      let pages = []

      for (let i = 0; i < numOfPages; i++) {
        pages[i] = i + 1
      }

      const pagesCopy = pages.slice()

      if (numOfPages < this.step * 4 + 2) {
        pages = pagesCopy.slice()
      } else if (this.page < this.step * 2 + 1) {
        pages = pagesCopy.slice(0, 13)
          .concat(['...', numOfPages])
      } else if (this.page > numOfPages - this.step * 5) {
        pages = [1, '...']
          .concat(pagesCopy.slice(numOfPages - this.step * 5 + 1, numOfPages))
      } else {
        pages = [1, '...']
          .concat(pagesCopy.slice(this.page - this.step - 2, this.page + this.step + 3))
          .concat(['...', numOfPages])
      }

      for (let i = 0; i < pages.length; i++) {
        const text = pages[i]
        const number = document.createElement('div')

        if (+text-1 === this.page) {
          number.classList.add('selected')
        }

        if (text === '...') {
          number.classList.add('truncation')
        } else {
          number.classList.add('page')
          number.onclick = this.onclick.bind(this, +text)
        }

        number.innerText = text
        this.pages.append(number)
      }
    }
  }

  const renderCompanies = function (response) {
    const data = JSON.parse(response)
    const container = document.querySelector('.companies')
    const list = document.createElement('ul')

    list.classList.add('list')
    container.innerHTML = ''

    for (let i = 0; i < data.results.length; i++) {
      const company = data.results[i]
      const item = document.createElement('li')

      item.innerHTML = `<div class="company company-${i}">
        <div class='title'>
          <div class='img-container'><img src="${company.avatarUrl}"/></div>
          <div class='company-data'>
            <span class='company-name'>${company.name}</span>
            <div class='labor-types'>${company.laborType.join(', ')}</div>
          </div>
          <div class='toggle'><div class='collapsed toggle-${i}' onclick="toggleDetails(${i})"></div></div>
        </div>
        <div class='details details-${i} hide'>
          <div>Phone: ${company.phone}</div>
          <div>Website: ${company.website}</div>
        </div>
      </div>`

      list.append(item)
    }
    container.append(list)
  }

  const fetchCompanies = function (start = 0, query = {}) {
    const xmlHttpRequest = new XMLHttpRequest()
    const additionalParams = Object.keys(query)
      .filter(k => query[k])
      .map(k => `${k}=${query[k]}`)
      .join('&')

    const params = `?start=${start}${additionalParams ? '&' + additionalParams : ''}`

    xmlHttpRequest.open('GET', 'api/companies' + params)
    xmlHttpRequest.onload = function() {
      switch (xmlHttpRequest.status) {
        case 200:
          const data = JSON.parse(xmlHttpRequest.response)
          renderCompanies(xmlHttpRequest.response)
          paginator.generatePages(data.total)
          return
        default:
          console.log('some error has occured...')
          return

      }
    }
    xmlHttpRequest.send()
  }

  const searchParams = new SearchParameters()
  const paginator = new Paginator({ searchParams, search: fetchCompanies })
  const search = new Search({ paginator, searchParams, search: fetchCompanies })
  fetchCompanies()
}())
