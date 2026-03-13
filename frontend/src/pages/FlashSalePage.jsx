// FlashSalePage.jsx
import { flashSalesAPI } from '../services/api'
import { FlashSaleTimer } from '../components/common/Widgets'
export function FlashSalePage() {
  const { slug } = useParams()
  const [sale, setSale] = useState(null)
  useEffect(() => { flashSalesAPI.list().then(d => setSale((d.results || d)[0])) }, [])
  if (!sale) return <div className="container section-sm"><p>No active flash sale right now. Check back soon! 🌸</p></div>
  return (
    <div className="container section-sm">
      <FlashSaleTimer endTime={sale.end_time} title={sale.title} discount={sale.discount_percentage} />
      <div className="grid-products mt-xl">
        {(sale.products || []).map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}