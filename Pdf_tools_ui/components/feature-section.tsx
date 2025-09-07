import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Shield, Download, Globe } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "빠른 변환",
    description: "몇 초 만에 웹페이지를 고품질 PDF로 변환합니다",
  },
  {
    icon: Shield,
    title: "안전한 처리",
    description: "모든 데이터는 안전하게 처리되며 변환 후 자동 삭제됩니다",
  },
  {
    icon: Download,
    title: "간편한 다운로드",
    description: "변환 완료 즉시 PDF 파일을 다운로드할 수 있습니다",
  },
  {
    icon: Globe,
    title: "모든 웹사이트 지원",
    description: "대부분의 웹사이트와 웹페이지를 PDF로 변환 가능합니다",
  },
]

export function FeatureSection() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">읽기전용 PDF 추출기</h2>
        <p className="text-lg text-muted-foreground">읽기전용 PDF를 추출해 보세요</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <feature.icon className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold text-foreground">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-muted-foreground">{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
