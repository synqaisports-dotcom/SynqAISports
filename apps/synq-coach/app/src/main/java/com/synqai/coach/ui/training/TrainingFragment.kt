package com.synqai.coach.ui.training

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.synqai.coach.R
import com.synqai.coach.SynqCoachApp
import com.synqai.coach.data.CoachRepository
import com.synqai.coach.data.local.ExerciseSlotEntity
import com.synqai.coach.databinding.FragmentTrainingBinding
import kotlinx.coroutines.launch

class TrainingFragment : Fragment() {
    private var _binding: FragmentTrainingBinding? = null
    private val binding get() = _binding!!
    private lateinit var repository: CoachRepository
    private val adapter = MicrocycleAdapter { id -> openMicrocycle(id) }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentTrainingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        repository = CoachRepository((requireActivity().application as SynqCoachApp).database)
        binding.microcycleList.layoutManager = LinearLayoutManager(requireContext())
        binding.microcycleList.adapter = adapter

        binding.btnCreateMicrocycle.setOnClickListener {
            val title = binding.inputMicroTitle.text?.toString()?.trim().orEmpty()
            val week = binding.inputMicroWeek.text?.toString()?.trim().orEmpty()
            if (title.isEmpty() || week.isEmpty()) {
                Toast.makeText(requireContext(), R.string.training_fields_required, Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            viewLifecycleOwner.lifecycleScope.launch {
                val result = repository.createMicrocycle(title, week)
                result.onSuccess {
                    binding.inputMicroTitle.text?.clear()
                    binding.inputMicroWeek.text?.clear()
                    refresh()
                }.onFailure {
                    Toast.makeText(requireContext(), R.string.training_max_microcycles, Toast.LENGTH_LONG).show()
                }
            }
        }

        refresh()
    }

    private fun openMicrocycle(id: Long) {
        parentFragmentManager.beginTransaction()
            .replace(R.id.nav_host, MicrocycleDetailFragment.newInstance(id))
            .addToBackStack(null)
            .commit()
    }

    private fun refresh() {
        viewLifecycleOwner.lifecycleScope.launch {
            val items = repository.getMicrocycles()
            adapter.submit(items)
            binding.trainingHint.text = getString(R.string.training_limit_hint, items.size)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

class MicrocycleAdapter(private val onOpen: (Long) -> Unit) : androidx.recyclerview.widget.RecyclerView.Adapter<MicrocycleAdapter.VH>() {
    private var items: List<com.synqai.coach.data.local.MicrocycleEntity> = emptyList()

    fun submit(list: List<com.synqai.coach.data.local.MicrocycleEntity>) {
        items = list
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val view = LayoutInflater.from(parent.context).inflate(android.R.layout.simple_list_item_2, parent, false)
        return VH(view)
    }

    override fun onBindViewHolder(holder: VH, position: Int) = holder.bind(items[position])

    override fun getItemCount(): Int = items.size

    inner class VH(itemView: View) : androidx.recyclerview.widget.RecyclerView.ViewHolder(itemView) {
        fun bind(item: com.synqai.coach.data.local.MicrocycleEntity) {
            val t1 = itemView.findViewById<android.widget.TextView>(android.R.id.text1)
            val t2 = itemView.findViewById<android.widget.TextView>(android.R.id.text2)
            t1.text = item.title
            t2.text = item.weekLabel
            itemView.setOnClickListener { onOpen(item.id) }
        }
    }
}
