package com.synqai.coach.ui.league

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.synqai.coach.data.local.MatchEntity
import com.synqai.coach.databinding.ItemMatchBinding
import java.text.DateFormat
import java.util.Date

class MatchAdapter(
    private val onGoalHome: (MatchEntity) -> Unit,
) : RecyclerView.Adapter<MatchAdapter.VH>() {
    private var items: List<MatchEntity> = emptyList()

    fun submit(list: List<MatchEntity>) {
        items = list
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val binding = ItemMatchBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return VH(binding)
    }

    override fun onBindViewHolder(holder: VH, position: Int) = holder.bind(items[position])

    override fun getItemCount(): Int = items.size

    inner class VH(private val binding: ItemMatchBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(match: MatchEntity) {
            val prefix = if (match.isHome) "vs" else "@"
            binding.matchTitle.text = "$prefix ${match.opponent}"
            binding.matchScore.text = "${match.homeScore} - ${match.awayScore} (${match.status})"
            binding.matchDate.text = DateFormat.getDateTimeInstance().format(Date(match.scheduledAt))
            binding.btnGoal.setOnClickListener { onGoalHome(match) }
        }
    }
}
