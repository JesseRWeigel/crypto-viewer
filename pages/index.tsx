import { Typography } from '@material-ui/core'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { format } from 'date-fns'
const data = [
  { name: 'Page A', price: 400 },
  { name: 'Page B', price: 200 },
]

type ChartDataType = {
  name: string
  price: number
}
export default function Home() {
  const [chartData, setChartData] = useState<ChartDataType[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState()
  const getData = async () => {
    fetch(
      'https://data.messari.io/api/v1/assets/eth/metrics/price/time-series?start=2021-01-01&end=2021-02-01&interval=1d'
    )
      .then((res) => res.json())
      .then((data) => {
        setTimeSeriesData(data)
        let chartDataArray: ChartDataType[] = []
        data.data.values.forEach((item: number[]) => {
          chartDataArray.push({
            name: format(item[0], 'MM/dd/yyyy'),
            price: Math.round(item[4] * 1e2) / 1e2,
          })
        })
        setChartData(chartDataArray)
      })
  }

  const [metrics, setMetrics] = useState()
  const getMetrics = async () => {
    fetch('https://data.messari.io/api/v1/assets/eth/metrics')
      .then((res) => res.json())
      .then((data) => setMetrics(data))
  }

  useEffect(() => {
    getData()
    getMetrics()
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>Crypto Viewer</title>
        <meta name="description" content="A small crypto dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Typography>Crypto Viewer</Typography>
        {metrics && (
          <>
            <Typography>{metrics?.data?.name}</Typography>
            <Typography>{`Symbol: ${metrics?.data?.symbol}`}</Typography>
            <Typography>{`Market Cap Rank: ${metrics?.data.marketcap.rank}`}</Typography>
            <Typography>{`Current Price: $${metrics?.data.market_data.price_usd.toFixed(
              2
            )}`}</Typography>
            <Typography>{`All time high: $${metrics?.data.all_time_high.price.toFixed(
              2
            )}`}</Typography>
            <Typography>{`24h Change: ${metrics?.data.market_data.percent_change_usd_last_24_hours.toFixed(
              2
            )}%`}</Typography>
          </>
        )}
        {timeSeriesData && (
          <LineChart
            width={600}
            height={300}
            data={chartData}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <Line type="monotone" dataKey="price" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
          </LineChart>
        )}
      </main>
    </div>
  )
}
