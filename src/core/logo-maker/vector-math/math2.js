class Math2 {
  static dot2 (pa, pb) {
    return pa.x * pb.x + pa.y * pb.y
  }

  static clamp1 (x, a, b) {
    return Math.min(Math.max(x, a), b)
  }

  // Gets the length of a 2 dimensional vector
  static length2 (p) {
    return Math.sqrt(p.x * p.x + p.y * p.y)
  }

  // Gets the distance between two 2 dimensional vectors
  static distance2 (a, b) {
    return Math2.length2({
      x: b.x - a.x,
      y: b.y - a.y
    })
  }

  // Line function with sign return base on left or right of the vector
  // https://www.shadertoy.com/view/3s3XzX
  static line (p, a, b) {
    const pa = {
      x: p.x - a.x,
      y: p.y - a.y
    }
    const ba = {
      x: b.x - a.x,
      y: b.y - a.y
    }
    const ho = Math2.dot2(pa, ba) / Math2.dot2(ba, ba)
    const h = Math2.clamp1(ho, 0.0, 1.0)
    const ns = {
      x: pa.x - ba.x * h,
      y: pa.y - ba.y * h
    }
    const result = {
      dist: Math2.length2(ns),
      side: Math.sign(ba.x * pa.y - ba.y * pa.x),
      pos: ho,
      line: { a, b },
      point: p
    }
    // console.log('line:', p, a, b, pa, ba, result)

    return result
  }

  static getPointOnLine (a, b, ofs) {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.sqrt(dx * dx + dy * dy)
    const fact = len <= 0.001 ? 0 : ofs / len
    return {
      x: a.x + dx * fact,
      y: a.y + dy * fact
    }
  }

  static getPointOnLineFract (a, b, fract) {
    const dx = b.x - a.x
    const dy = b.y - a.y
    return {
      x: a.x + dx * fract,
      y: a.y + dy * fract
    }
  }

  static reflect2 (a, b) {
    return {
      x: a.x - (b.x - a.x),
      y: a.y - (b.y - a.y)
    }
  }

  static quadraticBezier (t, p0, p1, p2) {
    const tn = 1 - t
    return p0 * tn * tn + p1 * tn * t * 2 + p2 * t * t
  }

  static getAngle2 (a, b) {
    if (b) {
      return Math.atan2(b.y - a.y, b.x - a.x)
    } else {
      return Math.atan2(a.y, a.x)
    }
  }

  // return t (0-1), very hard to do, multiple answers
  // static reverseQuadraticBezier (x, p0, p1, p2) {
  //   x = p0 * (1 - t) ^ 2 +
  //       p1 * (1 - t) * t ^ 2 +
  //       p2 *           t ^ 2
  // }

  static cubicBezier (t, p0, p1, p2, p3) {
    const nt = 1 - t
    const nt2 = nt * nt
    const t2 = t * t

    return p0 * nt2 * nt + p1 * nt2 * t * 3 + p2 * nt * t2 * 3 + p3 * t * t2
  }

  // Check if pt is within a circle made around the line from pt1 to pt2
  static inCircle (pt1, pt2, pt) {
    const radius = Math2.distance2(pt1, pt2) * 0.5
    const center = {
      x: 0.5 * (pt1.x + pt2.x),
      y: 0.5 * (pt1.y + pt2.y)
    }
    const dx = pt.x - center.x
    const dy = pt.y - center.y
    if (dx * dx + dy * dy < radius * radius) {
      return { radius, center }
    }
  }

  // gets a circle origin and radius crossing all points
  static getCircle (pt1, pt2, pt3) {
    const a = Math2.distance2(pt1, pt2)
    const b = Math2.distance2(pt2, pt3)
    const c = Math2.distance2(pt3, pt1)
    if (a > b) {
      if (a > c) {
        const circle = Math2.inCircle(pt1, pt2, pt3)
        if (circle) {
          return circle
        }
      } else {
        const circle = Math2.inCircle(pt3, pt1, pt2)
        if (circle) {
          return circle
        }
      }
    } else {
      if (b > c) {
        const circle = Math2.inCircle(pt2, pt3, pt1)
        if (circle) {
          return circle
        }
      } else {
        const circle = Math2.inCircle(pt3, pt1, pt2)
        if (circle) {
          return circle
        }
      }
    }

    const radius = (a * b * c) / Math.sqrt((a + b + c) * (b + c - a) * (c + a - b) * (a + b - c))

    // this.debugPathStr += lineToPath(pt1, pt2)
    const ll1a = Math2.getPointOnLineFract(pt1, pt2, 0.5)
    const ll1b = {
      x: ll1a.x - (pt2.y - pt1.y) * 0.5,
      y: ll1a.y + (pt2.x - pt1.x) * 0.5
    }

    const ll2a = Math2.getPointOnLineFract(pt2, pt3, 0.5)
    const ll2b = {
      x: ll2a.x + (pt2.y - pt3.y) * 0.5,
      y: ll2a.y - (pt2.x - pt3.x) * 0.5
    }
    const center = Math2.getIntersection(ll1a, ll1b, ll2a, ll2b)
    return {
      radius,
      center
    }
  }

  static getIntersection (la1, la2, lb1, lb2) {
    const adx = la2.x - la1.x
    const ady = la2.y - la1.y
    const aa = adx / ady || 0

    const bdx = lb2.x - lb1.x
    const bdy = lb2.y - lb1.y
    const ab = bdx / bdy || 0

    if (Math.abs(adx) <= 0.001) {
      const x = la1.x
      const y = lb1.y + (Math.abs(ab) <= 0.001 ? 0 : (x - lb1.x) / ab)
      return {
        x,
        y
      }
    }

    if (Math.abs(ady) <= 0.001) {
      const y = la1.y
      const x = lb1.x + (y - lb1.y) * ab
      return {
        x,
        y
      }
    }

    if (Math.abs(bdx) <= 0.001) {
      const x = lb1.x
      const y = la1.y + (Math.abs(aa) <= 0.001 ? 0 : (x - la1.x) / aa)
      return {
        x,
        y
      }
    }

    if (Math.abs(bdy) <= 0.001) {
      const y = lb1.y
      const x = la1.x + (y - la1.y) * aa
      return {
        x,
        y
      }
    }

    if (Math.abs(aa) > 0 && Math.abs(ab) > 0) {
      // line 1: y = lb1.y + (x - lb1.x) / ab
      // line 2: y = la1.y + (x - la1.x) / aa
      // Makes
      //   lb1.y + (x - lb1.x) / ab = la1.y + (x - la1.x) / aa
      // move lb1.y to right
      //   (x - lb1.x) / ab = la1.y + (x - la1.x) / aa - lb1.y
      // Both side multiplied with ab
      //   (x - lb1.x) = la1.y * ab + (x - la1.x) / aa * ab - lb1.y * ab
      // this part to the left        ^^^^^^^^^^^^^^^^^^^^^
      //   (x - lb1.x) - (x - la1.x) / aa * ab  = la1.y * ab - lb1.y * ab
      // lb1.x to the right
      //   x                - (x - la1.x) / aa * ab  = la1.y * ab - lb1.y * ab + lb1.x
      // divide out x on left side
      //   x - x / aa * ab  - (   -la1.x  / aa * ab) = la1.y * ab - lb1.y * ab + lb1.x
      // move (   -la1.x  / aa * ab) back to right
      //   x - x / aa * ab  = (   -la1.x  / aa * ab) + la1.y * ab - lb1.y * ab + lb1.x
      // convert for acces to x
      //   x * (1 - 1 / aa * ab) = (-la1.x  / aa * ab) + la1.y * ab - lb1.y * ab + lb1.x
      // move (1 - 1 / aa * ab) to right
      //   x                    = ((-la1.x  / aa * ab) + la1.y * ab - lb1.y * ab + lb1.x) / (1 - 1 / aa * ab)
      // simplify
      //   x = (la1.y * ab - lb1.y * ab + lb1.x - la1.x / aa * ab) / (1 - 1 / aa * ab)
      //   x = ((la1.y - lb1.y) * ab + lb1.x - la1.x / aa * ab) / (1 - 1 / aa * ab)
      const x = ((la1.y - lb1.y) * ab + lb1.x - (la1.x / aa) * ab) / (1 - (1 / aa) * ab)
      const y = lb1.y + (x - lb1.x) / ab

      if (isFinite(x) && isFinite(y)) {
        return { x, y }
      }
    }
    // console.log('missed: ', aa, ab, la1, la2, lb1, lb2)
  }
}

Math2.TAU = Math.PI * 2.0

export default Math2
