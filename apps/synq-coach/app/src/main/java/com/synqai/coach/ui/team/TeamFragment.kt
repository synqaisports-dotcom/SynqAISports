package com.synqai.coach.ui.team

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.synqai.coach.R
import com.synqai.coach.SynqCoachApp
import com.synqai.coach.data.CoachRepository
import com.synqai.coach.data.local.PlayerEntity
import com.synqai.coach.databinding.FragmentTeamBinding
import com.synqai.coach.domain.PitchType
import kotlinx.coroutines.launch

class TeamFragment : Fragment() {
    private var _binding: FragmentTeamBinding? = null
    private val binding get() = _binding!!
    private lateinit var repository: CoachRepository
    private val adapter = PlayerAdapter { id ->
        viewLifecycleOwner.lifecycleScope.launch {
            repository.deletePlayer(id)
            refresh()
        }
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentTeamBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        repository = CoachRepository((requireActivity().application as SynqCoachApp).database)
        binding.playerList.layoutManager = LinearLayoutManager(requireContext())
        binding.playerList.adapter = adapter

        val pitchAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_dropdown_item, PitchType.entries.map {
            when (it) {
                PitchType.FOOTBALL_11 -> getString(R.string.pitch_f11)
                PitchType.FOOTBALL_7 -> getString(R.string.pitch_f7)
                PitchType.FUTSAL -> getString(R.string.pitch_futsal)
            }
        })
        binding.teamPitchSpinner.adapter = pitchAdapter

        binding.btnAddPlayer.setOnClickListener {
            val name = binding.inputName.text?.toString()?.trim().orEmpty()
            val number = binding.inputNumber.text?.toString()?.toIntOrNull() ?: 0
            val position = binding.inputPosition.text?.toString()?.trim().orEmpty()
            if (name.isEmpty()) {
                Toast.makeText(requireContext(), R.string.team_name_required, Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            viewLifecycleOwner.lifecycleScope.launch {
                repository.savePlayer(PlayerEntity(name = name, jerseyNumber = number, position = position))
                binding.inputName.text?.clear()
                binding.inputNumber.text?.clear()
                binding.inputPosition.text?.clear()
                refresh()
            }
        }

        viewLifecycleOwner.lifecycleScope.launch {
            repository.ensureTeam(getString(R.string.default_team_name), PitchType.FOOTBALL_7)
            val pitch = repository.getPitchType()
            binding.teamPitchSpinner.setSelection(PitchType.entries.indexOf(pitch))
            refresh()
        }

        binding.teamPitchSpinner.onItemSelectedListener = simpleItemSelectedListener {
            viewLifecycleOwner.lifecycleScope.launch {
                repository.updatePitchType(PitchType.entries[it])
            }
        }
    }

    private fun refresh() {
        viewLifecycleOwner.lifecycleScope.launch {
            adapter.submit(repository.getPlayers())
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

private fun simpleItemSelectedListener(onSelect: (Int) -> Unit): android.widget.AdapterView.OnItemSelectedListener {
    return object : android.widget.AdapterView.OnItemSelectedListener {
        override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: View?, position: Int, id: Long) = onSelect(position)
        override fun onNothingSelected(parent: android.widget.AdapterView<*>?) = Unit
    }
}
