package com.synqai.coach.ui.training

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.synqai.coach.R
import com.synqai.coach.SynqCoachApp
import com.synqai.coach.data.CoachRepository
import com.synqai.coach.data.local.ExerciseSlotEntity
import com.synqai.coach.databinding.FragmentMicrocycleDetailBinding
import com.synqai.coach.domain.ExerciseConditionalGrid
import com.synqai.coach.domain.ExerciseSheet
import com.synqai.coach.domain.ExerciseSheetCodec
import com.synqai.coach.domain.SlotType
import kotlinx.coroutines.launch

class MicrocycleDetailFragment : Fragment() {
    private var _binding: FragmentMicrocycleDetailBinding? = null
    private val binding get() = _binding!!
    private lateinit var repository: CoachRepository
    private var microcycleId: Long = 0
    private var slotsCache: List<ExerciseSlotEntity> = emptyList()

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
            slotsCache = repository.getSlots(microcycleId)
            binding.slotSpinner.adapter = android.widget.ArrayAdapter(
                requireContext(),
                android.R.layout.simple_spinner_dropdown_item,
                slotsCache.map { labelForSlot(it) },
            )
            binding.slotSpinner.onItemSelectedListener = object : android.widget.AdapterView.OnItemSelectedListener {
                override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: View?, position: Int, id: Long) {
                    if (position in slotsCache.indices) bindSheetToForm(slotsCache[position])
                }
                override fun onNothingSelected(parent: android.widget.AdapterView<*>?) = Unit
            }
            if (slotsCache.isNotEmpty()) bindSheetToForm(slotsCache.first())
        }
    }

    private fun bindSheetToForm(slot: ExerciseSlotEntity) {
        var sheet = ExerciseSheetCodec.fromJson(slot.sheetJson)
        if (sheet.title.isBlank()) {
            sheet = ExerciseSheetCodec.legacyFromSlot(
                slot.title,
                slot.notes,
                SlotType.valueOf(slot.slotType),
            )
        }
        binding.inputTitle.setText(sheet.title)
        binding.inputDidacticStrategy.setText(sheet.didacticStrategy)
        binding.inputObjectives.setText(sheet.objectives)
        binding.inputConditionalContent.setText(sheet.conditionalGrid.conditionalContent)
        binding.inputTime.setText(sheet.conditionalGrid.time)
        binding.inputSpace.setText(sheet.conditionalGrid.space)
        binding.inputGameSituation.setText(sheet.conditionalGrid.gameSituation)
        binding.inputCoordination.setText(sheet.conditionalGrid.coordination)
        binding.inputTechnical.setText(sheet.technicalAction)
        binding.inputTactical.setText(sheet.tacticalAction)
        binding.inputCollective.setText(sheet.collectiveContent)
        binding.inputDescription.setText(sheet.description)
        binding.inputRules.setText(sheet.rules)
        binding.inputCues.setText(sheet.coachingCues)
    }

    private fun readSheetFromForm(slot: ExerciseSlotEntity): ExerciseSheet {
        val grid = ExerciseConditionalGrid(
            conditionalContent = binding.inputConditionalContent.textText(),
            time = binding.inputTime.textText(),
            space = binding.inputSpace.textText(),
            gameSituation = binding.inputGameSituation.textText(),
            coordination = binding.inputCoordination.textText(),
        )
        return ExerciseSheet(
            taskType = when (SlotType.valueOf(slot.slotType)) {
                SlotType.WARMUP -> "warmup"
                SlotType.MAIN -> "main"
                SlotType.COOLDOWN -> "cooldown"
            },
            title = binding.inputTitle.textText(),
            didacticStrategy = binding.inputDidacticStrategy.textText(),
            objectives = binding.inputObjectives.textText(),
            conditionalGrid = grid,
            technicalAction = binding.inputTechnical.textText(),
            tacticalAction = binding.inputTactical.textText(),
            collectiveContent = binding.inputCollective.textText(),
            description = binding.inputDescription.textText(),
            rules = binding.inputRules.textText(),
            coachingCues = binding.inputCues.textText(),
        )
    }

    private fun EditText.textText(): String = text?.toString()?.trim().orEmpty()

    private fun labelForSlot(slot: ExerciseSlotEntity): String {
        val typeLabel = when (SlotType.valueOf(slot.slotType)) {
            SlotType.WARMUP -> getString(R.string.slot_warmup)
            SlotType.MAIN -> getString(R.string.slot_main)
            SlotType.COOLDOWN -> getString(R.string.slot_cooldown)
        }
        val title = ExerciseSheetCodec.fromJson(slot.sheetJson).title.ifBlank { slot.title }
        val suffix = if (title.isNotBlank()) " — $title" else ""
        return "${slot.orderIndex + 1}. $typeLabel$suffix"
    }

    private fun saveCurrentSlot() {
        viewLifecycleOwner.lifecycleScope.launch {
            val slots = repository.getSlots(microcycleId)
            val index = binding.slotSpinner.selectedItemPosition.coerceAtLeast(0)
            if (slots.isEmpty()) return@launch
            val slot = slots[index]
            val sheet = readSheetFromForm(slot)
            val updated = slot.copy(
                title = sheet.title,
                notes = sheet.description,
                sheetJson = ExerciseSheetCodec.toJson(sheet),
            )
            repository.updateSlot(updated)
            slotsCache = repository.getSlots(microcycleId)
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
