import { CircularProgress, Typography } from '@material-ui/core'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { format } from 'date-fns'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select, { SelectChangeEvent } from '@material-ui/core/Select'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import TableCell, { tableCellClasses } from '@material-ui/core/TableCell'
import { styled } from '@material-ui/core/styles'

type ChartDataType = {
  name: string
  price: number
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}))

export default function Home() {
  const [selectedAsset, setSelectedAsset] = useState('ethereum')
  const [chartData, setChartData] = useState<ChartDataType[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<any>()
  const getData = async () => {
    setChartData([])
    fetch(
      `https://data.messari.io/api/v1/assets/${selectedAsset}/metrics/price/time-series?start=2021-01-01&end=2021-02-01&interval=1d`
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
        console.log(chartDataArray)
        setChartData(chartDataArray)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const [metrics, setMetrics] = useState<any>()
  const getMetrics = async () => {
    fetch(`https://data.messari.io/api/v1/assets/${selectedAsset}/metrics`)
      .then((res) => res.json())
      .then((data) => setMetrics(data))
      .catch((err) => {
        console.log(err)
      })
  }
  const handleChange = (event: SelectChangeEvent) => {
    setSelectedAsset(event.target.value as string)
  }

  useEffect(() => {
    getData()
    getMetrics()
  }, [selectedAsset])
  const [assets, setAssets] = useState<any>()
  const getAssets = async () => {
    fetch('https://data.messari.io/api/v1/assets')
      .then((res) => res.json())
      .then((data) => setAssets(data))
      .catch((err) => {
        console.log(err)
      })
  }

  useEffect(() => {
    getData()
    getMetrics()
    getAssets()
  }, [])

  //https://stackoverflow.com/a/16233919/4718107
  const formatCurrency = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  })

  return (
    <div className={styles.container}>
      <Head>
        <title>Crypto Viewer</title>
        <meta name="description" content="A small crypto dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Typography style={{ marginTop: '50px' }} variant="h2">
          Crypto Viewer
        </Typography>
        {metrics ? (
          <div
            style={{
              marginTop: '20px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h4">{metrics?.data?.name}</Typography>
            <Typography>{`Symbol: ${metrics?.data?.symbol}`}</Typography>
            <Typography>{`Market Cap Rank: ${metrics?.data?.marketcap.rank}`}</Typography>
            <Typography>{`Current Price: ${formatCurrency.format(
              metrics?.data.market_data.price_usd
            )}`}</Typography>
            <Typography>{`All time high: ${formatCurrency.format(
              metrics?.data.all_time_high.price
            )}`}</Typography>
            <Typography>{`24h Change: ${metrics?.data.market_data.percent_change_usd_last_24_hours?.toFixed(
              2
            )}%`}</Typography>
          </div>
        ) : (
          <CircularProgress />
        )}
        {assets ? (
          <FormControl style={{ marginBottom: '20px' }}>
            <InputLabel id="asset-select-label">Asset</InputLabel>
            <Select
              labelId="asset-select-label"
              id="asset-select"
              value={selectedAsset}
              label="Asset"
              onChange={handleChange}
            >
              {assets?.data?.map((asset: any) => (
                <MenuItem key={asset.slug} value={asset.slug}>
                  {asset.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <CircularProgress />
        )}
        {chartData.length > 0 ? (
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
        ) : (
          <CircularProgress />
        )}
        {assets ? (
          <TableContainer style={{ marginTop: '20px' }} component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Asset</StyledTableCell>
                  <StyledTableCell align="right">Price(USD)</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assets.data.map((asset: any) => (
                  <StyledTableRow
                    key={asset.slug}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <StyledTableCell component="th" scope="row">
                      {asset.name}
                    </StyledTableCell>

                    <StyledTableCell
                      key={asset.id}
                      align="right"
                      component="th"
                      scope="row"
                    >{`${formatCurrency.format(
                      asset.metrics.market_data.price_usd
                    )}`}</StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <CircularProgress />
        )}
      </main>
    </div>
  )
}
