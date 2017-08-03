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

  class Search {
    constructor (params) {
      this.query = {
        name: '',
        laborTypes: []
      }
      this.timeout = null
      this.paginator = params.paginator
      this.element = document.querySelector('.tbx-search')
      this.element.onkeyup = debounce(this.search.bind(this), 1000)
    }

    search (s) {
      this.query.name = this.element.value
      this.paginator.page = 0
      fetchCompanies(0, this.query)
    }
  }

  class Paginator {
    constructor () {
      this.page = 0
      this.step = 3
      this.limit = 10
      this.numOfPages = 0

      this.element = document.querySelector('.paginator')
      this.searchElement = document.querySelector('.tbx-search')
      this.pages = document.querySelector('.pages')
      this.currentPageElement = document.querySelectorAll('.current-page')

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
        const name = this.searchElement.value
        this.page = idx === 0 ? 0 : idx - 1
        const start = this.page * this.limit
        fetchCompanies(start, { name })
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
      this.numOfPages = numOfPages

      this.currentPageElement[0].textContent = `Page ${this.page + 1} of ${this.numOfPages}`
      this.currentPageElement[1].textContent = `Page ${this.page + 1} of ${this.numOfPages}`

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

  const fetchCompanies = function (start = 0, query) {
    const xmlHttpRequest = new XMLHttpRequest()
    const params = '?start=' + start + (query && query.name ? '&q=' + query.name : '')

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

  const paginator = new Paginator()
  const search = new Search({ paginator })
  fetchCompanies()
}())
