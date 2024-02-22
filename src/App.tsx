// import { useState } from 'react'
import { useEffect, useState } from 'react'
import './App.scss'
import Card from './components/Card'


//  URL-string maker for a stripped github/in-styles ID tring

const makeImgurStr = (id: string): string => {
  return 'https://i.imgur.com/' + id + '.jpeg'
}


//  this the default image of the card
const CardBackDefault_array:string[] = [
  'uwCi1Vq',
  'Qh4bQ1D',
  'v3N6Jpc',
  'htyq4QF',
  'OBb9MAP',
  'W463cuz',
  'Gh7ORYQ',
  'MvE8oPW',
  // 'OeqF6i7', 'LhpcDwF'
]
const CardBackDefault_id : string = CardBackDefault_array[ 
  Math.floor(Math.random() * CardBackDefault_array.length)
]
const CardBackDefault: string = makeImgurStr (CardBackDefault_id)


//  shuffle default card collection

const shuffle_fisher_yates = (arr: { src: string }[]): { src: string }[] => {

  /*
  let currIdx = arr.length
  while (currIdx > 0) {
    let randIdx = Math.floor(Math.random() * currIdx)
    currIdx--
    [arr[currIdx], arr[randIdx]] = [arr[randIdx], arr[currIdx]]
  }
  */
  arr.sort(() => Math.random() - .5)
  return arr
}


//  default card collection

const readLinesFromInfile = async (): Promise<{ src: string }[]> => {
  try {
    const repo: string = 'https://raw.githubusercontent.com/nuoxoxo/in/main/'
    let filepaths = Array.from({ length: 7 }, (_, idx) => 
      `${repo}limited_edition_0${idx + 1}.in`
    )
    filepaths = [
      ... filepaths,
      repo + 'canciones.json',
      repo + 'canciones_edition_jazz.json'
    ]
    // console.log(filepaths, filepaths.length)
    const set: Set<{ src: string }> = new Set()
    for (const filepath of filepaths) {
      const response = await fetch (filepath)
      if (!response.ok) throw new Error('failed fecthing');
      const data: Record<string, { cover: string }> = await response.json()
      const lines = Object.values(data).map(({ cover }) => cover);
      const temp = lines.map((line) => ({ src: line }))
      temp.forEach( (item) => set.add (item))
    }
    return [ ... set ]
  } catch (err) {
    console.error(err)
    return []
  }
}
/*
const CardsImgSrc: { src: string }[] = [
  { 'src': 'Hz1X0JH' },
  { 'src': '9yv2mCJ' },
  { 'src': '6MG5HPe' },
  { 'src': 'zFmGDB4' },
  { 'src': 'fkCw83t' },
  { 'src': 'Aj8rD5P' },
  { 'src': 'QP32pW4' },
  { 'src': 'S6XtdpH' },
  { 'src': 'N90grdZ' },
  { 'src': 'bV9BjHm' },
  { 'src': 'lsnQcbr' },
  { 'src': 'OwDfLkA' },
  { 'src': 'jWy7uCZ' },
  { 'src': 'YjjHHWq' },
  { 'src': 'BsP0ADp' },
  { 'src': 'WYnL0R8' },
]
*/

const App = () => {

  const [CardsImgSrc, setCardsImgSrc] = useState<{ src: string }[]>([])
  useEffect(() => {
    // Call the function to read lines when the component mounts
    readLinesFromInfile().then((arr: { src: string }[]) => {
      setCardsImgSrc(arr);
    });
  }, []);

  // const [ Turns, setTurns ] = useState(0)
  const [ DuringFlip, setDuringFlip ] = useState<boolean>(false)

  const [ Cards, setCards ] = useState<{
    src: string;
    id: number;
    url: string;
    matched: boolean
  }[]>([])

  const [ g1, setg1 ] = useState<{
    src: string;
    id: number;
    url: string;
    matched: boolean
  } | null>( null )

  const [ g2, setg2 ] = useState<{
    src: string;
    id: number;
    url: string;
    matched: boolean
  } | null>( null )

  //  DBG
  // const [ hasClickedHandleGuessing, setHasClickedHandleGuessing ] = useState<boolean>(false)

  // shuffle using F.Y.N. and select N items
  const N = 12
  const CardsImgN = shuffle_fisher_yates([ ... CardsImgSrc]).slice(0, N)

  // double each item and shuffle w/ a condensed F.Y.N.
  const shuffle_matching_pairs = () => {
    const res = [...CardsImgN, ...CardsImgN]
      .sort(() => Math.random() - .5)
      .map( (c) => ({
        ...c, 
        src: c.src,
        id: Math.random(),
        url: makeImgurStr(c.src),
        matched : false
      }))
    setCards( res )
    // setTurns( 0 )
    setg1 (null)
    setg2 (null)

    // setIsGameStarted(true) // NEW

  }

  // console.log('/dbg shuffle', Turns, Cards)

  // handle guessing
  const handleGuessing = (c: {
    src: string;
    id: number;
    url: string;
    matched: boolean
  }): void => {

    // setHasClickedHandleGuessing(true) // DBG
    g1 == null ? setg1( c ) : setg2( c )
    // console.log('/guessed', c.src, c.id ) // DBG
    // 👇 won't log bc. not finished updating the state ---> should use useEffect
    // console.log('/state/in handler', g1, g2 )
  }

  const reset = () => {

    setg1(null)
    setg2(null)
    // setTurns(Turns + 1)
    setTimeout(() => setDuringFlip (false), 100)
  }

  // game starts onload
  useEffect (() => {
    shuffle_matching_pairs()
    setg1(null)
    setg2(null)
  }, [ CardsImgSrc ]) // Bugfix :: auto-start game onload

  useEffect(() => {

    if ( g1 && g2 ) {
      setDuringFlip( true )
      if (g1.src == g2.src) {
        // console.log('/Same') // DBG
        // operation        
        setCards ( arr => {
          return arr.map(c => {
            if ( c.src === g1.src ) {
              return { ... c, matched: true  }
            } else {
              return c
            }
          })
        })
        reset ()
      } else {
        // console.log('/Diff') // DBG
        setTimeout(() => reset (), 500)
        // needs timeout otherwise 2nd card wont flip
      }
    }
  }, [g1, g2, Cards])

  // console.log(Cards) // DBG


  // NEW
  /*
  const [timer, setTimer] = useState<number>(0)
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false)
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (isGameStarted) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 0.01)
      }, 10)
    }

    return () => clearInterval(intervalId)
  }, [isGameStarted])

  useEffect(() => {
    if (Cards.every((card) => card.matched)) {
      setIsGameStarted(false)
    }
  }, [Cards])
  */


  return (
    <>
      <div className='App'>
        {/* <h1> open console and see more! </h1> */}
        <div className='btn'>
          <button onClick={ shuffle_matching_pairs }>New Game</button>
        </div>

        {/*  NEW  */}
        {/* <div className='timer'>Timer: {timer} seconds</div> */}

        <div className='cards-grid'>

          {/* NEW way : functional component*/}
          {Cards.map( c => (
            <Card
              c={c}
              key={c.id}
              handleGuessing={handleGuessing}
              flipped={c.matched || c.id === g1?.id || c.id === g2?.id}
              CardBackDefault={CardBackDefault}
              DuringFlip={DuringFlip}
            />
          ))}

          {/* old way */}
          {/*
          {Cards.map(c => (
            <div key={c.id} className='cards-card-div'>
              <img className='cards-card cards-card-back' src={CardBackDefault}/>
              <img className='cards-card cards=card-front' src={c.url} />
            </div>
          ))}
          */}

        </div>
      </div>
    </>
  )
}

export default App
