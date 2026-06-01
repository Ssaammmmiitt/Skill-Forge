import { useState } from 'react'
import ButtonRaw from '../components/ui/ButtonRaw'
import ButtonOffset from '../components/ui/ButtonOffset'
import ButtonStar from '../components/ui/ButtonStar'
import ButtonArcade from '../components/ui/ButtonArcade'
import CardRaw from '../components/ui/CardRaw'
import CardStar from '../components/ui/CardStar'
import CardArcade from '../components/ui/CardArcade'
import BadgeRaw from '../components/ui/BadgeRaw'
import BadgeStar from '../components/ui/BadgeStar'
import BadgeArcade from '../components/ui/BadgeArcade'
import MetricRaw from '../components/ui/MetricRaw'
import MetricStar from '../components/ui/MetricStar'
import MetricArcade from '../components/ui/MetricArcade'
import ProgressRaw from '../components/ui/ProgressRaw'
import ProgressStar from '../components/ui/ProgressStar'
import StatRing from '../components/ui/StatRing'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import RadarChart from '../components/charts/RadarChart'
import LineChart from '../components/charts/LineChart'
import BarChart from '../components/charts/BarChart'
import { mockStudent } from '../utils/mockData'

const ComponentTest = () => {
  const [showToastInfo, setShowToastInfo] = useState(false)
  const [showToastSuccess, setShowToastSuccess] = useState(false)
  const [showToastArcade, setShowToastArcade] = useState(false)
  const [showModalStar, setShowModalStar] = useState(false)
  const [showModalRaw, setShowModalRaw] = useState(false)
  const [showModalArcade, setShowModalArcade] = useState(false)

  const chartLineData = [
    { round: 1, value: 62 },
    { round: 2, value: 71 },
    { round: 3, value: 78 },
    { round: 4, value: 84 },
    { round: 5, value: 88 }
  ]

  const chartBarData = [
    { name: 'HISTORY', value: 62 },
    { name: 'BIOLOGY', value: 71 },
    { name: 'MATH', value: 78 },
    { name: 'PHYSICS', value: 84 }
  ]

  return (
    <div className="min-h-full space-y-12">
      <h1 className="font-raw text-[48px] text-raw-white mb-8">COMPONENT TEST - PHASE 2</h1>

      <section>
        <h2 className="font-raw text-2xl text-raw-white mb-4">BUTTONS</h2>
        <div className="flex gap-4 flex-wrap items-center bg-[#333] p-6">
          <div>
            <p className="text-xs text-white mb-2">Offset (sm / md / lg)</p>
            <div className="flex flex-wrap gap-4 items-center">
              <ButtonOffset size="sm">SMALL</ButtonOffset>
              <ButtonOffset size="md">MEDIUM</ButtonOffset>
              <ButtonOffset size="lg">LARGE</ButtonOffset>
            </div>
          </div>
          <div>
            <p className="text-xs text-white mb-2">RawBlock</p>
            <ButtonRaw size="md">CLICK ME</ButtonRaw>
          </div>
          <div>
            <p className="text-xs text-white mb-2">StarChart Primary</p>
            <ButtonStar variant="primary" size="md">Click Me</ButtonStar>
          </div>
          <div>
            <p className="text-xs text-white mb-2">StarChart Secondary</p>
            <ButtonStar variant="secondary" size="md">Click Me</ButtonStar>
          </div>
          <div>
            <p className="text-xs text-white mb-2">Arcade</p>
            <ButtonArcade size="md">CLICK ME</ButtonArcade>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-raw text-2xl text-raw-white mb-4">CARDS</h2>
        <div className="grid grid-cols-3 gap-4">
          <CardRaw>
            <h3 className="font-raw text-lg mb-2">RawBlock Card</h3>
            <p className="font-body text-sm">Sharp borders, no radius</p>
          </CardRaw>
          <CardStar>
            <h3 className="font-space text-lg mb-2 text-space-text">StarChart Card</h3>
            <p className="font-body-space text-sm text-space-text">Rounded with glow</p>
          </CardStar>
          <CardArcade>
            <h3 className="font-arcade text-[10px] mb-2 text-arcade-primary">Arcade Card</h3>
            <p className="font-mono text-xs text-arcade-secondary">Dotted borders</p>
          </CardArcade>
        </div>
      </section>

      <section>
        <h2 className="font-raw text-2xl text-raw-white mb-4">BADGES</h2>
        <div className="flex gap-4 flex-wrap items-center bg-[#333] p-6">
          <BadgeRaw active={false}>INACTIVE</BadgeRaw>
          <BadgeRaw active={true}>ACTIVE</BadgeRaw>
          <BadgeStar status="completed">Completed</BadgeStar>
          <BadgeStar status="pending">Pending</BadgeStar>
          <BadgeStar status="missed">Missed</BadgeStar>
          <BadgeStar status="locked">Locked</BadgeStar>
          <BadgeArcade>LVL 2</BadgeArcade>
        </div>
      </section>

      <section>
        <h2 className="font-raw text-2xl text-raw-white mb-4">METRICS</h2>
        <div className="grid grid-cols-3 gap-4">
          <MetricRaw label="XP" value="1240" />
          <MetricStar label="Streak" value="4" />
          <MetricArcade label="SCORE" value="9999" />
        </div>
      </section>

      <section>
        <h2 className="font-raw text-2xl text-raw-white mb-4">PROGRESS BARS</h2>
        <div className="space-y-6 max-w-md">
          <ProgressRaw value={65} label="RAW PROGRESS" />
          <ProgressStar value={75} label="Star Progress" />
        </div>
      </section>

      <section>
        <h2 className="font-raw text-2xl text-raw-white mb-4">STAT RINGS</h2>
        <div className="flex gap-8">
          <StatRing label="INT" value={72} system="star" />
          <StatRing label="WIS" value={58} system="star" />
          <StatRing label="XP" value={85} system="arcade" />
        </div>
      </section>

      <section>
        <h2 className="font-raw text-2xl text-raw-white mb-4">SPINNERS - NEW</h2>
        <div className="flex gap-8 items-center bg-[#333] p-6">
          <div>
            <p className="text-xs text-white mb-2">Raw</p>
            <Spinner variant="raw" size="md" />
          </div>
          <div>
            <p className="text-xs text-white mb-2">Star</p>
            <Spinner variant="star" size="md" />
          </div>
          <div>
            <p className="text-xs text-white mb-2">Arcade</p>
            <Spinner variant="arcade" size="md" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-raw text-2xl text-raw-white mb-4">TOASTS - NEW</h2>
        <div className="flex gap-4 flex-wrap">
          <ButtonStar onClick={() => setShowToastInfo(true)}>Show Info Toast</ButtonStar>
          <ButtonStar onClick={() => setShowToastSuccess(true)}>Show Success Toast</ButtonStar>
          <ButtonArcade onClick={() => setShowToastArcade(true)}>Show Arcade Toast</ButtonArcade>
        </div>
        {showToastInfo && (
          <Toast
            message="This is an info notification from StarChart system"
            type="info"
            onDismiss={() => setShowToastInfo(false)}
          />
        )}
        {showToastSuccess && (
          <Toast
            message="Achievement unlocked! You've completed the challenge"
            type="success"
            onDismiss={() => setShowToastSuccess(false)}
          />
        )}
        {showToastArcade && (
          <Toast
            message="LEVEL UP! NEW HIGH SCORE!"
            type="arcade"
            onDismiss={() => setShowToastArcade(false)}
          />
        )}
      </section>

      <section>
        <h2 className="font-raw text-2xl text-raw-white mb-4">MODALS - NEW</h2>
        <div className="flex gap-4 flex-wrap">
          <ButtonStar onClick={() => setShowModalStar(true)}>StarChart Modal</ButtonStar>
          <ButtonRaw onClick={() => setShowModalRaw(true)}>RawBlock Modal</ButtonRaw>
          <ButtonArcade onClick={() => setShowModalArcade(true)}>Arcade Modal</ButtonArcade>
        </div>
        <Modal
          open={showModalStar}
          onClose={() => setShowModalStar(false)}
          title="Achievement Details"
          system="star"
        >
          <p className="font-body-space text-space-text">
            You've unlocked a new cognitive milestone. Your INT attribute has increased by 5 points.
            Continue practicing to reach the next level.
          </p>
        </Modal>
        <Modal
          open={showModalRaw}
          onClose={() => setShowModalRaw(false)}
          title="SYSTEM ALERT"
          system="raw"
        >
          <p className="font-body text-raw-black">
            This is a critical system notification. All raw block elements maintain sharp, brutal aesthetics.
            No rounded corners. No compromises.
          </p>
        </Modal>
        <Modal
          open={showModalArcade}
          onClose={() => setShowModalArcade(false)}
          title="GAME OVER"
          system="arcade"
        >
          <p className="font-mono text-arcade-secondary text-xs">
            INSERT COIN TO CONTINUE
          </p>
        </Modal>
      </section>

      <section>
        <h2 className="font-raw text-2xl text-raw-white mb-4">CHARTS - NEW</h2>
        <div className="space-y-8">
          <RadarChart data={mockStudent} title="Cognitive Attributes" />
          <LineChart data={chartLineData} title="Score Progression" />
          <BarChart data={chartBarData} title="Topic Performance" />
        </div>
      </section>
    </div>
  )
}

export default ComponentTest
