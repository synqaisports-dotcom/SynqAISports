package com.synqai.coach.ui.board

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.synqai.coach.R
import com.synqai.coach.SynqCoachApp
import com.synqai.coach.board.BoardPlayer
import com.synqai.coach.board.TacticalBoardView
import com.synqai.coach.data.CoachRepository
import com.synqai.coach.databinding.FragmentBoardBinding
import com.synqai.coach.domain.PitchType
import kotlinx.coroutines.launch

class BoardFragment : Fragment() {
    private var _binding: FragmentBoardBinding? = null
    private val binding get() = _binding!!
    private lateinit var repository: CoachRepository

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentBoardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        repository = CoachRepository((requireActivity().application as SynqCoachApp).database)

        val pitchOptions = PitchType.entries.map { getString(resourceForPitch(it)) }
        binding.pitchSpinner.adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_dropdown_item, pitchOptions)

        binding.btnMove.setOnClickListener { binding.boardView.tool = TacticalBoardView.Tool.MOVE }
        binding.btnArrow.setOnClickListener { binding.boardView.tool = TacticalBoardView.Tool.ARROW }
        binding.btnUndo.setOnClickListener { binding.boardView.undo() }
        binding.btnClear.setOnClickListener { binding.boardView.clearDrawings() }
        binding.btnLoadTeam.setOnClickListener { loadTeamOnBoard() }

        binding.pitchSpinner.onItemSelectedListener = object : android.widget.AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: View?, position: Int, id: Long) {
                val pitch = PitchType.entries[position]
                binding.boardView.pitchType = pitch
                viewLifecycleOwner.lifecycleScope.launch {
                    repository.updatePitchType(pitch)
                    loadTeamOnBoard()
                }
            }

            override fun onNothingSelected(parent: android.widget.AdapterView<*>?) = Unit
        }

        loadPitchAndTeam()
    }

    private fun resourceForPitch(pitch: PitchType): Int = when (pitch) {
        PitchType.FOOTBALL_11 -> R.string.pitch_f11
        PitchType.FOOTBALL_7 -> R.string.pitch_f7
        PitchType.FUTSAL -> R.string.pitch_futsal
    }

    private fun loadPitchAndTeam() {
        viewLifecycleOwner.lifecycleScope.launch {
            repository.ensureTeam(getString(R.string.default_team_name), PitchType.FOOTBALL_7)
            val pitch = repository.getPitchType()
            binding.boardView.pitchType = pitch
            binding.pitchSpinner.setSelection(PitchType.entries.indexOf(pitch))
            loadTeamOnBoard()
        }
    }

    private fun loadTeamOnBoard() {
        viewLifecycleOwner.lifecycleScope.launch {
            val players = repository.getPlayers()
            val boardPlayers = players.map {
                BoardPlayer(id = it.id, name = it.name, jerseyNumber = it.jerseyNumber, x = 0f, y = 0f)
            }
            binding.boardView.setPlayersFromRoster(boardPlayers)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
