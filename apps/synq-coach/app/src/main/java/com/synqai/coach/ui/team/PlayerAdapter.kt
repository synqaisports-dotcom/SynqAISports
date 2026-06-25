package com.synqai.coach.ui.team

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.synqai.coach.data.local.PlayerEntity
import com.synqai.coach.databinding.ItemPlayerBinding

class PlayerAdapter(
    private val onDelete: (Long) -> Unit,
) : RecyclerView.Adapter<PlayerAdapter.VH>() {
    private var items: List<PlayerEntity> = emptyList()

    fun submit(list: List<PlayerEntity>) {
        items = list
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val binding = ItemPlayerBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return VH(binding)
    }

    override fun onBindViewHolder(holder: VH, position: Int) = holder.bind(items[position])

    override fun getItemCount(): Int = items.size

    inner class VH(private val binding: ItemPlayerBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(player: PlayerEntity) {
            binding.playerTitle.text = "#${player.jerseyNumber} ${player.name}"
            binding.playerSubtitle.text = player.position
            binding.btnDelete.setOnClickListener { onDelete(player.id) }
        }
    }
}
