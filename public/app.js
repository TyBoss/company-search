(function() {

  window.toggleDetails = function (i) {
    const details = document.querySelector('.details-' + i)
    details.classList.toggle('hide')
  }

/*
  const paginator = {
    page: 1,
    step: 3,
    limit: 10
  } */

  class Search {
    constructor (params) {
      this.query = {
        name: '',
        laborTypes: []
      }
      this.timeout = null
      this.paginator = params.paginator
      this.element = document.querySelector('.tbxSearch')
      this.element.onkeyup = this.search.bind(this)
    }

    search (s) {
      if (this.timeout) {
        clearTimeout(this.timeout)
        this.timeout = null
      }

      this.timeout = setTimeout((function () {
        this.query.name = this.element.value
        fetchCompanies(0, this.query)
      }).bind(this), 1000)
    }
  }

  class Paginator {
    constructor () {
      this.page = 0
      this.step = 3
      this.limit = 10
      this.element = document.querySelector('.paginator')
    }

    onclick (idx) {
      const start = idx * this.limit
      this.page = idx
      fetchCompanies(start)
    }

    next () {

    }

    previous () {

    }

    generatePages (total = 0) {
      const numOfPages = Math.ceil(total / this.limit)
      for (let i = 0; i < numOfPages; i++) {
        const number = document.createElement('div')
        number.classList.add('page')
        number.innerText = i + 1
        number.onclick = (function() { this.onclick(i) }).bind(this)
        this.element.append(number)
      }
    }
  }

  const renderCompanies = function (response) {
    const data = JSON.parse(response)
    const container = document.querySelector('.companies')
    const list = document.createElement('ul')

    list.className = 'list'
    container.innerHTML = ''

    for (let i = 0; i < data.results.length; i++) {
      const company = data.results[i]
      const item = document.createElement('li')

      item.innerHTML = `<div class="company company-${i}">
        <div class='title'>
          <div><img src="${company.avatarUrl}"/></div>
          <div>
            <span>${company.name}</span>
            <div class='labor-types'>${company.laborType.join(', ')}</div>
          </div>
          <div><button class='expand' onclick="toggleDetails(${i})">Click Me!!!</button></div>
        </div>
        <div class='details details-${i} hide'>
          <div>${company.phone}</div>
          <div>${company.website}</div>
        </div>
      </div>`

      list.append(item)
    }
    container.append(list)
  }

  const fetchCompanies = function (start = 0, query) {
    const xmlHttpRequest = new XMLHttpRequest()
    const paginator = new Paginator()

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
