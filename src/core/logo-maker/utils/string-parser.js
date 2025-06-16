class StringParser {
  constructor (str) {
    this.str = str
    this.ix = 0
  }

  skipWhiteSpace () {
    while (this.str[this.ix] <= ' ') {
      this.ix++
    }
  }

  getNextChar () {
    this.skipWhiteSpace()
    return this.str[this.ix++]
  }

  endOfString () {
    return this.ix >= this.str.length
  }

  skipChar (ch) {
    this.skipWhiteSpace()
    const result = this.str[this.ix] === ch
    if (result) this.ix++
    return result
  }

  // This became very specific for handling path strings
  getFloat () {
    let res = ''
    this.skipWhiteSpace()
    const ch = this.str[this.ix]
    if (ch === '+' || ch === '-') {
      res += ch
      this.ix++
    }
    let pointCount = 0
    while (true) {
      let ch = this.str[this.ix]
      if ((ch >= '0' && ch <= '9') || ch === '.') {
        if (ch === '.') {
          if (++pointCount > 1) {
            break
          }
        }
        res += ch
        this.ix++
      } else if (ch === 'e' || ch === 'E') {
        pointCount = 0
        ch = this.str[++this.ix]
        if (ch === '+' || ch === '-') {
          res += 'e' + ch
          this.ix++
        } else {
          res += 'e'
        }
      } else {
        break
      }
    }
    return res
  }
}

export default StringParser
