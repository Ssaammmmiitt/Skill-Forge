import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { getLeaderboard } from '../api/analytics'
import ButtonOffset from '../components/ui/ButtonOffset'
import BadgeStar from '../components/ui/BadgeStar'
import BadgeArcade from '../components/ui/BadgeArcade'
import Spinner from '../components/ui/Spinner'
import PageIntro from '../components/layout/PageIntro'

const Leaderboard = () => {
  const user = useAuthStore(state => state.user)
  const [players, setPlayers] = useState([])
  const [sortBy, setSortBy] = useState('xp')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Document title
  useEffect(() => {
    document.title = 'SKILL FORGE // LEADERBOARD'
  }, [])

  const fetchLeaderboard = async (sort) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getLeaderboard(sort)
      setPlayers(data.leaderboard || [])
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard(sortBy)
  }, [])

  const handleSort = (sort) => {
    setSortBy(sort)
    fetchLeaderboard(sort)
  }

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-[#FDE047]'
    if (rank === 2) return 'text-[#C0C0C0]'
    if (rank === 3) return 'text-[#CD7F32]'
    return 'text-arcade-secondary'
  }

  const getRankSize = (rank) => {
    if (rank === 1) return 'text-[16px]'
    if (rank === 2 || rank === 3) return 'text-[12px]'
    return 'text-[9px]'
  }

  const getStyleBadge = (style) => {
    const styleMap = {
      fast_learner: 'completed',
      slow_learner: 'pending',
      conceptual: 'pending',
      memorization: 'locked'
    }
    return styleMap[style] || 'pending'
  }

  return (
    <div className="min-h-full bg-arcade-surface px-8 py-12">
      <div className="max-w-[1200px] mx-auto">

        <PageIntro
          title="LEADERBOARD"
          purpose="See how you rank against other learners on XP, INT, or WIS. Friendly competition-your personal ML insights are still on Analytics."
        />

        {/* SORT BUTTONS */}
        <div className="flex flex-wrap gap-4 mb-8">
          <ButtonOffset
            size="sm"
            active={sortBy === 'xp'}
            onClick={() => handleSort('xp')}
          >
            SORT: XP
          </ButtonOffset>
          <ButtonOffset
            size="sm"
            active={sortBy === 'INT'}
            onClick={() => handleSort('INT')}
          >
            SORT: INT
          </ButtonOffset>
          <ButtonOffset
            size="sm"
            active={sortBy === 'WIS'}
            onClick={() => handleSort('WIS')}
          >
            SORT: WIS
          </ButtonOffset>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Spinner variant="arcade" size="lg" />
          </div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <div className="font-arcade text-[9px] text-space-error tracking-[2px]">
            // ERROR // {error}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && players.length === 0 && (
          <div className="font-arcade text-[9px] text-arcade-secondary tracking-[2px]">
            NO PLAYERS YET
          </div>
        )}

        {/* LEADERBOARD ROWS */}
        {!loading && !error && players.length > 0 && (
          <div className="flex flex-col">
            {players.map((player, index) => {
              const rank = index + 1
              const isCurrentUser = player.student_id === user?.student_id

              return (
                <div
                  key={player.student_id}
                  className={`
                    flex justify-between items-center py-4
                    border-b-[3px] border-dotted border-arcade-primary
                    ${isCurrentUser ? 'bg-arcade-hover border-l-[3px] border-solid border-space-star pl-3' : ''}
                  `}
                >
                  {/* RANK */}
                  <div className={`font-arcade ${getRankSize(rank)} ${getRankColor(rank)} w-12`}>
                    #{String(rank).padStart(2, '0')}
                  </div>

                  {/* NAME */}
                  <div className="flex-1 font-raw text-raw-white text-sm uppercase tracking-[2px]">
                    {player.name}
                  </div>

                  {/* XP */}
                  <div className="font-arcade text-[9px] text-space-star tracking-[2px] w-24 text-right">
                    {player.xp} XP
                  </div>

                  {/* LEVEL */}
                  <div className="w-20 text-right">
                    <BadgeArcade>LVL {player.level}</BadgeArcade>
                  </div>

                  {/* STYLE */}
                  <div className="w-32 text-right">
                    <BadgeStar status={getStyleBadge(player.learning_style)}>
                      {player.learning_style?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                    </BadgeStar>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

export default Leaderboard
