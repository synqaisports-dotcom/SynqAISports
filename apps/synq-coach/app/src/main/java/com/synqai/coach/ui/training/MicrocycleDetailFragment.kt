package com.synqai.coach.ui.training

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.synqai.coach.R
import com.synqai.coach.SynqCoachApp
import com.synqai.coach.data.CoachRepository
import com.synqai.coach.data.local.ExerciseSlotEntity
import com.synqai.coach.databinding.FragmentMicrocycleDetailBinding
import com.synqai.coach.domain.SlotType
import kotlinx.coroutines.launch

class MicrocycleDetailFragment : Fragment() {
    private var _binding: FragmentMicrocycleDetailBinding? = null
    private val binding get() = _binding!!
    private lateinit var repository: CoachRepository
    private var microcycleId: Long = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        microcycleId = arguments?.getLong(ARG_ID) ?: 0
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentMicrocycleDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        repository = CoachRepository((requireActivity().application as SynqCoachApp).database)

        binding.btnSaveSlot.setOnClickListener { saveCurrentSlot() }
        binding.btnClearDrawing.setOnClickListener { binding.exerciseBoard.clear() }

        viewLifecycleOwner.lifecycleScope.launch {
            val slots = repository.getSlots(microcycleId)
            binding.slotSpinner.adapter = android.widget.ArrayAdapter(
                requireContext(),
                android.R.layout.simple_spinner_dropdown_item,
                slots.map { labelForSlot(it) },
            )
            binding.slotSpinner.onItemSelectedListener = object : android.widget.AdapterView.OnItemSelectedListener {
                override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: View?, position: Int, id: Long) {
                    if (position in slots.indices) {
                        val slot = slots[position]
                        binding.inputSlotTitle.setText(slot.title)
                        binding.inputSlotNotes.setText(slot.notes)
                    }
                }

                override fun onNothingSelected(parent: android.widget.AdapterView<*>?) = Unit
            }
            if (slots.isNotEmpty()) {
                binding.inputSlotTitle.setText(slots.first().title)
                binding.inputSlotNotes.setText(slots.first().notes)
            }
        }
    }

    private fun labelForSlot(slot: ExerciseSlotEntity): String {
        val typeLabel = when (SlotType.valueOf(slot.slotType)) {
            SlotType.WARMUP -> getString(R.string.slot_warmup)
            SlotType.MAIN -> getString(R.string.slot_main)
            SlotType.COOLDOWN -> getString(R.string.slot_cooldown)
        }
        return "${slot.orderIndex + 1}. $typeLabel"
    }

    private fun saveCurrentSlot() {
        viewLifecycleOwner.lifecycleScope.launch {
            val slots = repository.getSlots(microcycleId)
            val index = binding.slotSpinner.selectedItemPosition.coerceAtLeast(0)
            if (slots.isEmpty()) return@launch
            val slot = slots[index]
            val updated = slot.copy(
                title = binding.inputSlotTitle.text?.toString()?.trim().orEmpty(),
                notes = binding.inputSlotNotes.text?.toString()?.trim().orEmpty(),
            )
            repository.updateSlot(updated)
            Toast.makeText(requireContext(), R.string.saved, Toast.LENGTH_SHORT).show()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        private const val ARG_ID = "id"
        fun newInstance(id: Long) = MicrocycleDetailFragment().apply {
            arguments = Bundle().apply { putLong(ARG_ID, id) }
        }
    }
}
